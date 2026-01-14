import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

export function activate(context: vscode.ExtensionContext) {
    console.log('CzechScript extension is now active!');

    // Compile command
    const compileCommand = vscode.commands.registerCommand('czechscript.compile', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('Není otevřen žádný soubor!');
            return;
        }

        const document = editor.document;
        if (document.languageId !== 'czechscript') {
            vscode.window.showErrorMessage('Tento soubor není CzechScript!');
            return;
        }

        await document.save();

        const config = vscode.workspace.getConfiguration('czechscript');
        const compilerPath = config.get<string>('compiler.path', 'czechscript');
        const optimize = config.get<boolean>('compiler.optimize', true);
        const strict = config.get<boolean>('compiler.strict', false);

        const filePath = document.uri.fsPath;
        const outputPath = filePath.replace(/\.cs$/, '.js');

        const args = [filePath, '-o', outputPath];
        if (!optimize) args.push('--no-optimize');
        if (strict) args.push('--strict');

        const outputChannel = vscode.window.createOutputChannel('CzechScript');
        outputChannel.show();

        outputChannel.appendLine(`🔨 Kompiluji: ${path.basename(filePath)}`);

        try {
            const result = await executeCommand(compilerPath, args);
            
            if (result.exitCode === 0) {
                outputChannel.appendLine('✅ Kompilace úspěšná!');
                outputChannel.appendLine(`📄 Výstup: ${path.basename(outputPath)}`);
                vscode.window.showInformationMessage('CzechScript zkompilován úspěšně!');
            } else {
                outputChannel.appendLine('❌ Kompilace selhala!');
                outputChannel.appendLine(result.stderr || result.stdout);
                vscode.window.showErrorMessage('Chyba při kompilaci!');
            }
        } catch (error: any) {
            outputChannel.appendLine(`❌ Chyba: ${error.message}`);
            vscode.window.showErrorMessage(`Chyba: ${error.message}`);
        }
    });

    // Run command
    const runCommand = vscode.commands.registerCommand('czechscript.run', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('Není otevřen žádný soubor!');
            return;
        }

        const document = editor.document;
        if (document.languageId !== 'czechscript') {
            vscode.window.showErrorMessage('Tento soubor není CzechScript!');
            return;
        }

        await document.save();

        const config = vscode.workspace.getConfiguration('czechscript');
        const compilerPath = config.get<string>('compiler.path', 'czechscript');
        const filePath = document.uri.fsPath;

        const outputChannel = vscode.window.createOutputChannel('CzechScript');
        outputChannel.show();

        outputChannel.appendLine(`▶️ Spouštím: ${path.basename(filePath)}`);

        try {
            const result = await executeCommand(compilerPath, [filePath, '--run']);
            
            outputChannel.appendLine('');
            outputChannel.appendLine('=== VÝSTUP ===');
            outputChannel.appendLine(result.stdout);
            
            if (result.stderr) {
                outputChannel.appendLine('');
                outputChannel.appendLine('=== CHYBY ===');
                outputChannel.appendLine(result.stderr);
            }
        } catch (error: any) {
            outputChannel.appendLine(`❌ Chyba: ${error.message}`);
            vscode.window.showErrorMessage(`Chyba: ${error.message}`);
        }
    });

    // Show AST command
    const showASTCommand = vscode.commands.registerCommand('czechscript.showAST', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('Není otevřen žádný soubor!');
            return;
        }

        const document = editor.document;
        if (document.languageId !== 'czechscript') {
            vscode.window.showErrorMessage('Tento soubor není CzechScript!');
            return;
        }

        await document.save();

        const config = vscode.workspace.getConfiguration('czechscript');
        const compilerPath = config.get<string>('compiler.path', 'czechscript');
        const filePath = document.uri.fsPath;

        try {
            const result = await executeCommand(compilerPath, [filePath, '--ast']);
            
            // Create new document with AST
            const astDoc = await vscode.workspace.openTextDocument({
                content: result.stdout,
                language: 'json'
            });
            
            await vscode.window.showTextDocument(astDoc, vscode.ViewColumn.Beside);
        } catch (error: any) {
            vscode.window.showErrorMessage(`Chyba: ${error.message}`);
        }
    });

    // New file command
    const newFileCommand = vscode.commands.registerCommand('czechscript.newFile', async () => {
        const fileName = await vscode.window.showInputBox({
            prompt: 'Název souboru (bez přípony)',
            placeHolder: 'muj-program'
        });

        if (!fileName) return;

        const template = `// CzechScript soubor
// Vytvořeno: ${new Date().toLocaleString('cs-CZ')}

funkce hlavní() {
    vypis("Ahoj, světe!");
}

hlavní();
`;

        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            vscode.window.showErrorMessage('Není otevřen žádný workspace!');
            return;
        }

        const filePath = path.join(workspaceFolder.uri.fsPath, `${fileName}.cs`);
        
        fs.writeFileSync(filePath, template, 'utf-8');
        
        const doc = await vscode.workspace.openTextDocument(filePath);
        await vscode.window.showTextDocument(doc);
        
        vscode.window.showInformationMessage(`Vytvořen soubor: ${fileName}.cs`);
    });

    // Diagnostic provider (error checking)
    const diagnosticCollection = vscode.languages.createDiagnosticCollection('czechscript');
    context.subscriptions.push(diagnosticCollection);

    // Update diagnostics on save
    const diagnosticProvider = vscode.workspace.onDidSaveTextDocument(async (document) => {
        if (document.languageId !== 'czechscript') return;

        const config = vscode.workspace.getConfiguration('czechscript');
        const compilerPath = config.get<string>('compiler.path', 'czechscript');

        try {
            const result = await executeCommand(compilerPath, [document.uri.fsPath, '--strict']);
            
            // Parse errors and warnings
            const diagnostics: vscode.Diagnostic[] = [];
            
            // This would parse compiler output for errors
            // For now, clear diagnostics on successful compile
            if (result.exitCode === 0) {
                diagnosticCollection.set(document.uri, diagnostics);
            }
        } catch (error) {
            // Handle errors
        }
    });

    context.subscriptions.push(
        compileCommand,
        runCommand,
        showASTCommand,
        newFileCommand,
        diagnosticProvider
    );
}

export function deactivate() {}

function executeCommand(command: string, args: string[]): Promise<{stdout: string, stderr: string, exitCode: number}> {
    return new Promise((resolve, reject) => {
        const proc = cp.spawn(command, args);
        
        let stdout = '';
        let stderr = '';
        
        proc.stdout.on('data', (data) => {
            stdout += data.toString();
        });
        
        proc.stderr.on('data', (data) => {
            stderr += data.toString();
        });
        
        proc.on('close', (code) => {
            resolve({
                stdout,
                stderr,
                exitCode: code || 0
            });
        });
        
        proc.on('error', (error) => {
            reject(error);
        });
    });
}
