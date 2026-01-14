/**
 * CzechScript Build Tools
 * Bundler, minifier a tree-shaking
 */

const fs = require('fs').promises;
const path = require('path');
const { Compiler } = require('./compiler');

class CzechScriptBundler {
    constructor(možnosti = {}) {
        this.možnosti = {
            vstup: 'index.cs',
            výstup: 'dist/bundle.js',
            minifikovat: false,
            sourceMap: false,
            treeShaking: true,
            target: 'es2015',
            ...možnosti
        };
        
        this.moduly = new Map();
        this.závislosti = new Map();
        this.compiler = new Compiler();
    }
    
    // Hlavní build funkce
    async build() {
        console.log('🔨 Začínám build...\n');
        
        const začátek = Date.now();
        
        // 1. Načti vstupní soubor
        const vstupníCesta = path.resolve(this.možnosti.vstup);
        console.log(`📁 Načítám: ${vstupníCesta}`);
        
        await this.načtiModul(vstupníCesta);
        
        // 2. Tree shaking
        if (this.možnosti.treeShaking) {
            console.log('🌳 Provádím tree-shaking...');
            this.proveďTreeShaking();
        }
        
        // 3. Sestav bundle
        console.log('📦 Sestavuji bundle...');
        const bundle = this.sestavBundle();
        
        // 4. Minifikace
        let výslednýKód = bundle;
        if (this.možnosti.minifikovat) {
            console.log('🗜️  Minifikuji...');
            výslednýKód = this.minifikuj(bundle);
        }
        
        // 5. Vytvoř výstupní složku
        const výstupníCesta = path.resolve(this.možnosti.výstup);
        const výstupníSložka = path.dirname(výstupníCesta);
        await fs.mkdir(výstupníSložka, { recursive: true });
        
        // 6. Ulož výsledek
        await fs.writeFile(výstupníCesta, výslednýKód, 'utf8');
        
        const konec = Date.now();
        const velikost = Buffer.byteLength(výslednýKód, 'utf8');
        
        console.log('\n✅ Build dokončen!');
        console.log(`   📄 Výstup: ${výstupníCesta}`);
        console.log(`   📊 Velikost: ${this.formátujVelikost(velikost)}`);
        console.log(`   ⏱  Čas: ${konec - začátek}ms`);
        console.log(`   📦 Modulů: ${this.moduly.size}`);
        
        return {
            výstup: výstupníCesta,
            velikost,
            čas: konec - začátek,
            početModulů: this.moduly.size
        };
    }
    
    // Načti modul a jeho závislosti
    async načtiModul(cesta, rodič = null) {
        const normalizovanáCesta = path.resolve(cesta);
        
        if (this.moduly.has(normalizovanáCesta)) {
            return;
        }
        
        const zdrojovýKód = await fs.readFile(normalizovanáCesta, 'utf8');
        
        // Kompiluj CzechScript -> JavaScript
        const výsledek = this.compiler.compile(zdrojovýKód, {
            sourceMap: false,
            optimize: true
        });
        
        if (výsledek.errors.length > 0) {
            throw new Error(`Chyby v ${cesta}:\n${výsledek.errors.join('\n')}`);
        }
        
        const modul = {
            cesta: normalizovanáCesta,
            zdrojovýKód,
            transpilovanýKód: výsledek.code,
            ast: výsledek.ast,
            importy: this.extrahujImporty(výsledek.ast),
            exporty: this.extrahujExporty(výsledek.ast),
            použité: false
        };
        
        this.moduly.set(normalizovanáCesta, modul);
        
        if (rodič) {
            if (!this.závislosti.has(rodič)) {
                this.závislosti.set(rodič, []);
            }
            this.závislosti.get(rodič).push(normalizovanáCesta);
        }
        
        // Rekurzivně načti závislosti
        for (const importCesta of modul.importy) {
            const absolutníCesta = path.resolve(
                path.dirname(normalizovanáCesta),
                importCesta
            );
            
            await this.načtiModul(absolutníCesta, normalizovanáCesta);
        }
    }
    
    // Extrahuj importy z AST
    extrahujImporty(ast) {
        const importy = [];
        
        function navštiv(uzel) {
            if (!uzel || typeof uzel !== 'object') return;
            
            if (uzel.type === 'ImportDeclaration' && uzel.source) {
                importy.push(uzel.source.value);
            }
            
            for (const klíč in uzel) {
                if (Array.isArray(uzel[klíč])) {
                    uzel[klíč].forEach(navštiv);
                } else if (typeof uzel[klíč] === 'object') {
                    navštiv(uzel[klíč]);
                }
            }
        }
        
        navštiv(ast);
        return importy;
    }
    
    // Extrahuj exporty z AST
    extrahujExporty(ast) {
        const exporty = [];
        
        function navštiv(uzel) {
            if (!uzel || typeof uzel !== 'object') return;
            
            if (uzel.type === 'ExportNamedDeclaration') {
                if (uzel.declaration) {
                    if (uzel.declaration.declarations) {
                        uzel.declaration.declarations.forEach(d => {
                            exporty.push(d.id.name);
                        });
                    } else if (uzel.declaration.id) {
                        exporty.push(uzel.declaration.id.name);
                    }
                }
            }
            
            for (const klíč in uzel) {
                if (Array.isArray(uzel[klíč])) {
                    uzel[klíč].forEach(navštiv);
                } else if (typeof uzel[klíč] === 'object') {
                    navštiv(uzel[klíč]);
                }
            }
        }
        
        navštiv(ast);
        return exporty;
    }
    
    // Tree shaking - odstraň nepoužité moduly
    proveďTreeShaking() {
        // Označ vstupní modul jako použitý
        const vstupníCesta = path.resolve(this.možnosti.vstup);
        this.označJakoPožité(vstupníCesta);
        
        // Smaž nepoužité moduly
        for (const [cesta, modul] of this.moduly) {
            if (!modul.použité) {
                console.log(`  🗑️  Odstraněn nepoužitý modul: ${path.basename(cesta)}`);
                this.moduly.delete(cesta);
            }
        }
    }
    
    // Rekurzivně označ modul a jeho závislosti jako použité
    označJakoPožité(cesta) {
        const modul = this.moduly.get(cesta);
        if (!modul || modul.použité) return;
        
        modul.použité = true;
        
        const deps = this.závislosti.get(cesta) || [];
        deps.forEach(depCesta => this.označJakoPožité(depCesta));
    }
    
    // Sestav finální bundle
    sestavBundle() {
        const moduly = Array.from(this.moduly.values());
        
        let bundle = '(function() {\n';
        bundle += '  "use strict";\n\n';
        bundle += '  // CzechScript Bundle\n';
        bundle += '  // Generováno: ' + new Date().toISOString() + '\n\n';
        
        // Module loader
        bundle += '  const __modules = {};\n';
        bundle += '  const __cache = {};\n\n';
        
        bundle += '  function __require(modulePath) {\n';
        bundle += '    if (__cache[modulePath]) return __cache[modulePath];\n';
        bundle += '    const module = { exports: {} };\n';
        bundle += '    __cache[modulePath] = module.exports;\n';
        bundle += '    __modules[modulePath](module, module.exports, __require);\n';
        bundle += '    return module.exports;\n';
        bundle += '  }\n\n';
        
        // Registruj moduly
        moduly.forEach(modul => {
            const relativníCesta = path.relative(process.cwd(), modul.cesta);
            
            bundle += `  __modules["${relativníCesta}"] = function(module, exports, require) {\n`;
            
            // Nahraď importy
            let kód = modul.transpilovanýKód;
            modul.importy.forEach(importCesta => {
                const from = `import .* from ['"]${importCesta}['"]`;
                const to = `const imported = require("${importCesta}")`;
                kód = kód.replace(new RegExp(from, 'g'), to);
            });
            
            // Přidej kód modulu
            kód.split('\n').forEach(řádek => {
                bundle += '    ' + řádek + '\n';
            });
            
            bundle += '  };\n\n';
        });
        
        // Spusť vstupní modul
        const vstupníCesta = path.relative(
            process.cwd(),
            path.resolve(this.možnosti.vstup)
        );
        
        bundle += `  __require("${vstupníCesta}");\n`;
        bundle += '})();\n';
        
        return bundle;
    }
    
    // Minifikace
    minifikuj(kód) {
        // Odstran komentáře
        kód = kód.replace(/\/\*[\s\S]*?\*\//g, '');
        kód = kód.replace(/\/\/.*/g, '');
        
        // Odstran nadbytečné whitespace
        kód = kód.replace(/\s+/g, ' ');
        kód = kód.replace(/\s*([{}();,:])\s*/g, '$1');
        
        // Optimalizace
        kód = kód.replace(/\bif\s*\(\s*true\s*\)/g, 'if(1)');
        kód = kód.replace(/\bif\s*\(\s*false\s*\)/g, 'if(0)');
        
        return kód;
    }
    
    // Formátuj velikost
    formátujVelikost(bajty) {
        if (bajty < 1024) return bajty + ' B';
        if (bajty < 1024 * 1024) return (bajty / 1024).toFixed(2) + ' KB';
        return (bajty / (1024 * 1024)).toFixed(2) + ' MB';
    }
    
    // Watch mode
    async watch() {
        console.log('👀 Watch mode aktivní...\n');
        
        await this.build();
        
        const sledovanéSoubory = new Set();
        for (const [cesta] of this.moduly) {
            sledovanéSoubory.add(cesta);
        }
        
        sledovanéSoubory.forEach(cesta => {
            fs.watch(cesta, async (eventType) => {
                if (eventType === 'change') {
                    console.log(`\n📝 Změna detekována: ${path.basename(cesta)}`);
                    
                    // Vyčisti cache
                    this.moduly.clear();
                    this.závislosti.clear();
                    
                    // Rebuild
                    await this.build();
                }
            });
        });
        
        console.log('\nSledované soubory:', Array.from(sledovanéSoubory).map(c => path.basename(c)).join(', '));
    }
}

module.exports = { CzechScriptBundler };
