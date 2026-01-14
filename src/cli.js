#!/usr/bin/env node

/**
 * CzechScript CLI
 * Příkazový řádek pro CzechScript
 */

const fs = require('fs');
const path = require('path');
const { CzechScriptCompiler } = require('./compiler');

const args = process.argv.slice(2);

// Help
if (args.includes('--help') || args.includes('-h') || args.length === 0) {
    console.log(`
CzechScript Compiler v1.0.0
Kompiluje CzechScript do JavaScriptu

Použití:
  czechscript <soubor.cs>              Zkompiluje soubor
  czechscript <soubor.cs> -o out.js    Zkompiluje a uloží výstup
  czechscript -w <soubor.cs>           Sleduje změny a automaticky kompiluje
  czechscript --ast <soubor.cs>        Zobrazí AST
  czechscript --tokens <soubor.cs>     Zobrazí tokeny
  czechscript --run <soubor.cs>        Zkompiluje a spustí

Možnosti:
  -o, --output <soubor>    Výstupní soubor
  -w, --watch              Sledovat změny
  --ast                    Zobrazit AST
  --tokens                 Zobrazit tokeny
  --run                    Spustit po kompilaci
  --no-optimize            Vypnout optimalizace
  --strict                 Striktní režim (více kontrol)
  -h, --help               Zobrazit nápovědu
  -v, --version            Zobrazit verzi
`);
    process.exit(0);
}

// Version
if (args.includes('--version') || args.includes('-v')) {
    console.log('CzechScript v1.0.0');
    process.exit(0);
}

// Parse arguments
const options = {
    input: null,
    output: null,
    watch: false,
    showAST: false,
    showTokens: false,
    run: false,
    optimize: true,
    strict: false
};

for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
        case '-o':
        case '--output':
            options.output = args[++i];
            break;
        case '-w':
        case '--watch':
            options.watch = true;
            break;
        case '--ast':
            options.showAST = true;
            break;
        case '--tokens':
            options.showTokens = true;
            break;
        case '--run':
            options.run = true;
            break;
        case '--no-optimize':
            options.optimize = false;
            break;
        case '--strict':
            options.strict = true;
            break;
        default:
            if (!arg.startsWith('-')) {
                options.input = arg;
            }
    }
}

if (!options.input) {
    console.error('❌ Chyba: Nebyl zadán vstupní soubor');
    process.exit(1);
}

// Compile function
function compile(inputPath) {
    try {
        // Read source
        const source = fs.readFileSync(inputPath, 'utf-8');
        
        // Compile
        const compiler = new CzechScriptCompiler({
            optimize: options.optimize,
            strict: options.strict
        });
        
        const result = compiler.compile(source, inputPath);
        
        // Show tokens
        if (options.showTokens && result.tokens) {
            console.log('\n📝 Tokeny:');
            console.log(JSON.stringify(result.tokens, null, 2));
        }
        
        // Show AST
        if (options.showAST && result.ast) {
            console.log('\n🌳 AST:');
            console.log(JSON.stringify(result.ast, null, 2));
        }
        
        // Check for errors
        if (!result.success) {
            console.error('\n❌ Kompilace selhala:\n');
            result.errors.forEach(error => {
                console.error(`  ${error.type}: ${error.message}`);
            });
            process.exit(1);
        }
        
        // Show warnings
        if (result.warnings.length > 0) {
            console.warn('\n⚠️  Varování:\n');
            result.warnings.forEach(warning => {
                console.warn(`  ${warning.type}: ${warning.message}`);
            });
        }
        
        // Output
        if (options.output) {
            fs.writeFileSync(options.output, result.code, 'utf-8');
            console.log(`\n✅ Úspěšně zkompilováno do: ${options.output}`);
        } else if (!options.showAST && !options.showTokens && !options.run) {
            console.log('\n📄 Výsledný kód:\n');
            console.log(result.code);
        }
        
        // Run
        if (options.run) {
            console.log('\n▶️  Spouštím...\n');
            eval(result.code);
        }
        
    } catch (error) {
        console.error(`\n❌ Chyba při čtení souboru: ${error.message}`);
        process.exit(1);
    }
}

// Watch mode
if (options.watch) {
    console.log(`👀 Sleduji změny v: ${options.input}`);
    
    compile(options.input);
    
    fs.watch(options.input, (eventType) => {
        if (eventType === 'change') {
            console.log('\n🔄 Detekována změna, kompiluji...');
            compile(options.input);
        }
    });
} else {
    compile(options.input);
}
