#!/usr/bin/env node

/**
 * CzechScript REPL (Read-Eval-Print Loop)
 * Interaktivní konzole pro CzechScript
 */

const readline = require('readline');
const { CzechScriptCompiler } = require('./compiler');
const vm = require('vm');

class CzechScriptREPL {
    constructor() {
        this.compiler = new CzechScriptCompiler({ strict: false, optimize: true });
        this.context = vm.createContext({
            console,
            require,
            process,
            Buffer,
            setTimeout,
            setInterval,
            clearTimeout,
            clearInterval,
            ...require('./runtime')
        });
        
        this.history = [];
        this.multiLineBuffer = '';
        this.bracketCount = 0;
        
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: this.getPrompt(),
            completer: this.completer.bind(this)
        });
        
        this.setupReadline();
    }
    
    getPrompt() {
        return this.multiLineBuffer ? '... ' : 'cs> ';
    }
    
    setupReadline() {
        // Welcome message
        console.log('╔════════════════════════════════════════════════════════════╗');
        console.log('║          🇨🇿 CzechScript REPL v1.0.0                       ║');
        console.log('║    Interaktivní konzole pro programování v češtině        ║');
        console.log('╚════════════════════════════════════════════════════════════╝');
        console.log('');
        console.log('💡 Tipy:');
        console.log('  - Napište .help pro nápovědu');
        console.log('  - Napište .exit pro ukončení');
        console.log('  - Použijte Tab pro automatické doplňování');
        console.log('  - Šipky nahoru/dolů pro historii příkazů');
        console.log('');
        
        this.rl.on('line', (line) => {
            this.handleLine(line.trim());
        });
        
        this.rl.on('close', () => {
            console.log('\n👋 Nashledanou!');
            process.exit(0);
        });
        
        this.rl.prompt();
    }
    
    handleLine(line) {
        // Special commands
        if (line.startsWith('.')) {
            this.handleCommand(line);
            this.rl.prompt();
            return;
        }
        
        // Empty line
        if (!line && !this.multiLineBuffer) {
            this.rl.prompt();
            return;
        }
        
        // Multi-line support
        this.multiLineBuffer += line + '\n';
        this.updateBracketCount(line);
        
        // Check if we need more input
        if (this.bracketCount > 0 || line.endsWith('{') || line.endsWith('(')) {
            this.rl.setPrompt(this.getPrompt());
            this.rl.prompt();
            return;
        }
        
        // Evaluate
        const code = this.multiLineBuffer.trim();
        this.multiLineBuffer = '';
        this.bracketCount = 0;
        this.rl.setPrompt(this.getPrompt());
        
        if (code) {
            this.evaluate(code);
            this.history.push(code);
        }
        
        this.rl.prompt();
    }
    
    updateBracketCount(line) {
        for (const char of line) {
            if (char === '{' || char === '(' || char === '[') {
                this.bracketCount++;
            } else if (char === '}' || char === ')' || char === ']') {
                this.bracketCount--;
            }
        }
    }
    
    evaluate(code) {
        try {
            // Add implicit return for expressions
            let wrappedCode = code;
            
            // Check if it's an expression (not a statement)
            if (!code.match(/^(proměnná|konstanta|funkce|třída|když|dokud|pro_každý|opakuj|zkus|importuj|exportuj)\b/)) {
                wrappedCode = `vrať ${code}`;
            }
            
            // Compile CzechScript to JavaScript
            const result = this.compiler.compile(wrappedCode, '<repl>');
            
            if (!result.success) {
                console.error('❌ Chyba při kompilaci:');
                result.errors.forEach(err => {
                    console.error(`   ${err.message}`);
                });
                return;
            }
            
            // Show warnings
            if (result.warnings.length > 0) {
                result.warnings.forEach(warn => {
                    console.warn(`⚠️  ${warn.message}`);
                });
            }
            
            // Execute in VM context
            const script = new vm.Script(result.code, {
                filename: '<repl>',
                displayErrors: true
            });
            
            const output = script.runInContext(this.context, {
                timeout: 5000,
                breakOnSigint: true
            });
            
            // Display result
            if (output !== undefined) {
                console.log('→', this.formatOutput(output));
            }
            
        } catch (error) {
            console.error('❌ Běhová chyba:', error.message);
            if (error.stack) {
                console.error(this.formatStackTrace(error.stack));
            }
        }
    }
    
    formatOutput(value) {
        if (value === null) return 'null';
        if (value === undefined) return 'undefined';
        if (typeof value === 'string') return `"${value}"`;
        if (typeof value === 'function') return '[Funkce]';
        if (Array.isArray(value)) return `[${value.map(v => this.formatOutput(v)).join(', ')}]`;
        if (typeof value === 'object') {
            try {
                return JSON.stringify(value, null, 2);
            } catch {
                return String(value);
            }
        }
        return String(value);
    }
    
    formatStackTrace(stack) {
        return stack
            .split('\n')
            .filter(line => !line.includes('node:internal'))
            .map(line => '  ' + line)
            .join('\n');
    }
    
    handleCommand(cmd) {
        const [command, ...args] = cmd.split(' ');
        
        switch (command) {
            case '.help':
            case '.pomoc':
                this.showHelp();
                break;
            
            case '.exit':
            case '.quit':
            case '.konec':
                console.log('👋 Nashledanou!');
                process.exit(0);
                break;
            
            case '.clear':
            case '.vymaž':
                console.clear();
                break;
            
            case '.history':
            case '.historie':
                this.showHistory();
                break;
            
            case '.save':
            case '.ulož':
                this.saveHistory(args[0]);
                break;
            
            case '.load':
            case '.načti':
                this.loadFile(args[0]);
                break;
            
            case '.reset':
                this.resetContext();
                break;
            
            case '.vars':
            case '.proměnné':
                this.showVariables();
                break;
            
            case '.js':
                this.showJavaScript(args.join(' '));
                break;
            
            case '.ast':
                this.showAST(args.join(' '));
                break;
            
            case '.time':
            case '.čas':
                this.timeExecution(args.join(' '));
                break;
            
            default:
                console.log(`❌ Neznámý příkaz: ${command}`);
                console.log('💡 Napište .help pro seznam příkazů');
        }
    }
    
    showHelp() {
        console.log('\n📚 CzechScript REPL - Nápověda\n');
        console.log('Příkazy:');
        console.log('  .help, .pomoc         - Zobrazí tuto nápovědu');
        console.log('  .exit, .quit, .konec  - Ukončí REPL');
        console.log('  .clear, .vymaž        - Vymaže obrazovku');
        console.log('  .history, .historie   - Zobrazí historii příkazů');
        console.log('  .save <soubor>        - Uloží historii do souboru');
        console.log('  .load <soubor>        - Načte a spustí soubor');
        console.log('  .reset                - Resetuje kontext (vymaže proměnné)');
        console.log('  .vars, .proměnné      - Zobrazí definované proměnné');
        console.log('  .js <kód>             - Zobrazí zkompilovaný JavaScript');
        console.log('  .ast <kód>            - Zobrazí Abstract Syntax Tree');
        console.log('  .time <kód>           - Změří dobu vykonání kódu');
        console.log('');
        console.log('Zkratky:');
        console.log('  Ctrl+C                - Přeruší aktuální příkaz');
        console.log('  Ctrl+D                - Ukončí REPL');
        console.log('  Tab                   - Automatické doplňování');
        console.log('  ↑/↓                   - Historie příkazů');
        console.log('');
    }
    
    showHistory() {
        console.log('\n📜 Historie příkazů:\n');
        this.history.forEach((cmd, i) => {
            console.log(`${i + 1}. ${cmd}`);
        });
        console.log('');
    }
    
    saveHistory(filename) {
        if (!filename) {
            console.log('❌ Zadejte název souboru: .save <soubor>');
            return;
        }
        
        const fs = require('fs');
        const content = this.history.join('\n\n');
        
        try {
            fs.writeFileSync(filename, content, 'utf-8');
            console.log(`✅ Historie uložena do: ${filename}`);
        } catch (error) {
            console.error(`❌ Chyba při ukládání: ${error.message}`);
        }
    }
    
    loadFile(filename) {
        if (!filename) {
            console.log('❌ Zadejte název souboru: .load <soubor>');
            return;
        }
        
        const fs = require('fs');
        
        try {
            const content = fs.readFileSync(filename, 'utf-8');
            console.log(`📂 Načítám: ${filename}\n`);
            this.evaluate(content);
        } catch (error) {
            console.error(`❌ Chyba při načítání: ${error.message}`);
        }
    }
    
    resetContext() {
        this.context = vm.createContext({
            console,
            require,
            process,
            Buffer,
            setTimeout,
            setInterval,
            clearTimeout,
            clearInterval,
            ...require('./runtime')
        });
        console.log('🔄 Kontext resetován');
    }
    
    showVariables() {
        console.log('\n📦 Definované proměnné:\n');
        
        const userVars = Object.keys(this.context).filter(key => {
            return !['console', 'require', 'process', 'Buffer', 'setTimeout', 
                     'setInterval', 'clearTimeout', 'clearInterval'].includes(key);
        });
        
        if (userVars.length === 0) {
            console.log('  (žádné uživatelské proměnné)');
        } else {
            userVars.forEach(key => {
                const value = this.context[key];
                console.log(`  ${key}: ${typeof value} = ${this.formatOutput(value)}`);
            });
        }
        console.log('');
    }
    
    showJavaScript(code) {
        if (!code) {
            console.log('❌ Zadejte CzechScript kód: .js <kód>');
            return;
        }
        
        const result = this.compiler.compile(code, '<repl>');
        
        if (result.success) {
            console.log('\n📄 Zkompilovaný JavaScript:\n');
            console.log(result.code);
        } else {
            console.error('❌ Chyba při kompilaci:');
            result.errors.forEach(err => console.error(`   ${err.message}`));
        }
    }
    
    showAST(code) {
        if (!code) {
            console.log('❌ Zadejte CzechScript kód: .ast <kód>');
            return;
        }
        
        try {
            const ast = this.compiler.compileToAST(code);
            console.log('\n🌳 Abstract Syntax Tree:\n');
            console.log(JSON.stringify(ast, null, 2));
        } catch (error) {
            console.error('❌ Chyba:', error.message);
        }
    }
    
    timeExecution(code) {
        if (!code) {
            console.log('❌ Zadejte CzechScript kód: .time <kód>');
            return;
        }
        
        const start = process.hrtime.bigint();
        this.evaluate(code);
        const end = process.hrtime.bigint();
        
        const duration = Number(end - start) / 1_000_000; // Convert to ms
        console.log(`\n⏱️  Doba vykonání: ${duration.toFixed(3)} ms`);
    }
    
    completer(line) {
        const keywords = [
            'proměnná', 'konstanta', 'funkce', 'vrať', 'když', 'pak', 'jinak',
            'dokud', 'opakuj', 'pro_každý', 'v', 'přeruš', 'pokračuj',
            'třída', 'konstruktor', 'tento', 'super', 'nový', 'rozšiřuje',
            'zkus', 'chyť', 'nakonec', 'hoď', 'importuj', 'exportuj',
            'pravda', 'nepravda', 'null', 'nedefinováno',
            'a', 'nebo', 'ne', 'rovno', 'nerovno', 'větší', 'menší',
            'vypis', 'vypisChybu', 'prvek', 'prvky', 'načtiData'
        ];
        
        const commands = [
            '.help', '.pomoc', '.exit', '.quit', '.konec', '.clear', '.vymaž',
            '.history', '.historie', '.save', '.ulož', '.load', '.načti',
            '.reset', '.vars', '.proměnné', '.js', '.ast', '.time', '.čas'
        ];
        
        const completions = [...keywords, ...commands, ...Object.keys(this.context)];
        const hits = completions.filter(c => c.startsWith(line));
        
        return [hits.length ? hits : completions, line];
    }
    
    start() {
        this.rl.prompt();
    }
}

// Start REPL
if (require.main === module) {
    const repl = new CzechScriptREPL();
    repl.start();
}

module.exports = { CzechScriptREPL };
