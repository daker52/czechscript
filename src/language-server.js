/**
 * CzechScript Language Server Protocol (LSP)
 * IDE features: autocomplete, go-to-definition, diagnostics, refactoring
 */

const {
    createConnection,
    TextDocuments,
    ProposedFeatures,
    InitializeParams,
    DidChangeConfigurationNotification,
    CompletionItem,
    CompletionItemKind,
    TextDocumentPositionParams,
    TextDocumentSyncKind,
    InitializeResult
} = require('vscode-languageserver/node');

const { TextDocument } = require('vscode-languageserver-textdocument');
const { Lexer } = require('./lexer');
const { Parser } = require('./parser');
const { Compiler } = require('./compiler');

class CzechScriptLanguageServer {
    constructor() {
        this.connection = createConnection(ProposedFeatures.all);
        this.documents = new TextDocuments(TextDocument);
        
        this.hasConfigurationCapability = false;
        this.hasWorkspaceFolderCapability = false;
        this.hasDiagnosticRelatedInformationCapability = false;
        
        this.dokumentyAST = new Map();
        this.symboly = new Map();
        
        this.setupHandlers();
    }
    
    setupHandlers() {
        // Inicializace
        this.connection.onInitialize((params) => {
            return this.onInitialize(params);
        });
        
        this.connection.onInitialized(() => {
            if (this.hasConfigurationCapability) {
                this.connection.client.register(
                    DidChangeConfigurationNotification.type,
                    undefined
                );
            }
        });
        
        // Změna dokumentu
        this.documents.onDidChangeContent(change => {
            this.validateDocument(change.document);
        });
        
        // Autocomplete
        this.connection.onCompletion((textDocumentPosition) => {
            return this.provideCompletion(textDocumentPosition);
        });
        
        // Completion resolve
        this.connection.onCompletionResolve((item) => {
            return this.resolveCompletion(item);
        });
        
        // Hover
        this.connection.onHover((params) => {
            return this.provideHover(params);
        });
        
        // Go to definition
        this.connection.onDefinition((params) => {
            return this.provideDefinition(params);
        });
        
        // Find references
        this.connection.onReferences((params) => {
            return this.provideReferences(params);
        });
        
        // Rename
        this.connection.onRenameRequest((params) => {
            return this.provideRename(params);
        });
        
        // Formatting
        this.connection.onDocumentFormatting((params) => {
            return this.provideFormatting(params);
        });
        
        // Code actions
        this.connection.onCodeAction((params) => {
            return this.provideCodeActions(params);
        });
    }
    
    onInitialize(params) {
        const capabilities = params.capabilities;
        
        this.hasConfigurationCapability = !!(
            capabilities.workspace && !!capabilities.workspace.configuration
        );
        this.hasWorkspaceFolderCapability = !!(
            capabilities.workspace && !!capabilities.workspace.workspaceFolders
        );
        this.hasDiagnosticRelatedInformationCapability = !!(
            capabilities.textDocument &&
            capabilities.textDocument.publishDiagnostics &&
            capabilities.textDocument.publishDiagnostics.relatedInformation
        );
        
        const result = {
            capabilities: {
                textDocumentSync: TextDocumentSyncKind.Incremental,
                completionProvider: {
                    resolveProvider: true,
                    triggerCharacters: ['.', ':']
                },
                hoverProvider: true,
                definitionProvider: true,
                referencesProvider: true,
                renameProvider: true,
                documentFormattingProvider: true,
                codeActionProvider: true
            }
        };
        
        if (this.hasWorkspaceFolderCapability) {
            result.capabilities.workspace = {
                workspaceFolders: {
                    supported: true
                }
            };
        }
        
        return result;
    }
    
    // Validace dokumentu
    async validateDocument(document) {
        const text = document.getText();
        const uri = document.uri;
        
        try {
            const compiler = new Compiler();
            const result = compiler.compile(text, {
                sourceMap: false
            });
            
            // Uložení AST
            this.dokumentyAST.set(uri, result.ast);
            
            // Extrakce symbolů
            this.extrahovátSymboly(uri, result.ast);
            
            // Diagnostika
            const diagnostics = [];
            
            result.errors.forEach(error => {
                diagnostics.push({
                    severity: 1, // Error
                    range: {
                        start: {
                            line: error.line - 1,
                            character: error.column
                        },
                        end: {
                            line: error.line - 1,
                            character: error.column + 10
                        }
                    },
                    message: error.message,
                    source: 'CzechScript'
                });
            });
            
            result.warnings.forEach(warning => {
                diagnostics.push({
                    severity: 2, // Warning
                    range: {
                        start: {
                            line: warning.line - 1,
                            character: warning.column
                        },
                        end: {
                            line: warning.line - 1,
                            character: warning.column + 10
                        }
                    },
                    message: warning.message,
                    source: 'CzechScript'
                });
            });
            
            this.connection.sendDiagnostics({ uri, diagnostics });
            
        } catch (error) {
            const diagnostics = [{
                severity: 1,
                range: {
                    start: { line: 0, character: 0 },
                    end: { line: 0, character: 10 }
                },
                message: error.message,
                source: 'CzechScript'
            }];
            
            this.connection.sendDiagnostics({ uri, diagnostics });
        }
    }
    
    // Extrakce symbolů z AST
    extrahovátSymboly(uri, ast) {
        const symboly = [];
        
        function navštiv(uzel) {
            if (!uzel || !uzel.type) return;
            
            if (uzel.type === 'FunctionDeclaration' && uzel.id) {
                symboly.push({
                    name: uzel.id.name,
                    kind: 'function',
                    location: uzel.location
                });
            }
            
            if (uzel.type === 'VariableDeclaration') {
                uzel.declarations?.forEach(decl => {
                    if (decl.id) {
                        symboly.push({
                            name: decl.id.name,
                            kind: 'variable',
                            location: decl.location
                        });
                    }
                });
            }
            
            if (uzel.type === 'ClassDeclaration' && uzel.id) {
                symboly.push({
                    name: uzel.id.name,
                    kind: 'class',
                    location: uzel.location
                });
            }
            
            // Rekurze
            for (const key in uzel) {
                if (Array.isArray(uzel[key])) {
                    uzel[key].forEach(navštiv);
                } else if (uzel[key] && typeof uzel[key] === 'object') {
                    navštiv(uzel[key]);
                }
            }
        }
        
        navštiv(ast);
        this.symboly.set(uri, symboly);
    }
    
    // Autocomplete
    provideCompletion(textDocumentPosition) {
        const completions = [];
        
        // Klíčová slova
        const klíčováSlova = [
            'funkce', 'proměnná', 'konstanta', 'když', 'jinak',
            'pro', 'dokud', 'vrať', 'třída', 'rozšiřuje',
            'nový', 'toto', 'export', 'import', 'z',
            'async', 'čekej', 'zkus', 'chyť', 'konečně',
            'přeruš', 'pokračuj', 'přepni', 'případ', 'výchozí'
        ];
        
        klíčováSlova.forEach(slovo => {
            completions.push({
                label: slovo,
                kind: CompletionItemKind.Keyword,
                data: slovo
            });
        });
        
        // Built-in funkce
        const builtIns = [
            'vypiš', 'načtiData', 'odesliData', 'prvek', 'prvky',
            'vytvoř', 'mapuj', 'filtruj', 'redukuj', 'najdi',
            'seřaď', 'forEach', 'některý', 'každý'
        ];
        
        builtIns.forEach(fn => {
            completions.push({
                label: fn,
                kind: CompletionItemKind.Function,
                data: fn
            });
        });
        
        // Symboly z dokumentu
        const uri = textDocumentPosition.textDocument.uri;
        const symboly = this.symboly.get(uri) || [];
        
        symboly.forEach(symbol => {
            const kind = symbol.kind === 'function' 
                ? CompletionItemKind.Function
                : symbol.kind === 'class'
                ? CompletionItemKind.Class
                : CompletionItemKind.Variable;
            
            completions.push({
                label: symbol.name,
                kind,
                data: symbol.name
            });
        });
        
        return completions;
    }
    
    // Completion resolve
    resolveCompletion(item) {
        // Přidej dokumentaci
        const dokumentace = {
            'vypiš': 'Vypíše hodnoty do konzole',
            'funkce': 'Deklarace funkce\nSyntaxe: funkce název(parametry) { ... }',
            'proměnná': 'Deklarace proměnné\nSyntaxe: proměnná název = hodnota;',
            'konstanta': 'Deklarace konstanty\nSyntaxe: konstanta název = hodnota;'
        };
        
        if (dokumentace[item.data]) {
            item.documentation = dokumentace[item.data];
        }
        
        return item;
    }
    
    // Hover
    provideHover(params) {
        // Implementace hover info
        return null;
    }
    
    // Go to definition
    provideDefinition(params) {
        // Implementace go to definition
        return null;
    }
    
    // Find references
    provideReferences(params) {
        // Implementace find references
        return [];
    }
    
    // Rename
    provideRename(params) {
        // Implementace rename
        return null;
    }
    
    // Formatting
    provideFormatting(params) {
        // Implementace formatting
        return [];
    }
    
    // Code actions
    provideCodeActions(params) {
        // Implementace code actions
        return [];
    }
    
    // Spuštění serveru
    start() {
        this.documents.listen(this.connection);
        this.connection.listen();
        console.log('🚀 CzechScript Language Server spuštěn');
    }
}

// Vytvoření a spuštění serveru
const server = new CzechScriptLanguageServer();
server.start();

module.exports = { CzechScriptLanguageServer };
