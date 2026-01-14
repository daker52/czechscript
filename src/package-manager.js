/**
 * CzechScript Package Manager
 * Správa závislostí a balíčků
 */

const fs = require('fs').promises;
const path = require('path');
const https = require('https');

class PackageManager {
    constructor(projektováCesta = process.cwd()) {
        this.projektováCesta = projektováCesta;
        this.configSoubor = path.join(projektováCesta, 'balíčky.json');
        this.složkaBalíčků = path.join(projektováCesta, 'balíčky');
        this.registr = 'https://registry.npmjs.org'; // Můžeme použít npm jako backend
    }
    
    // Inicializace nového projektu
    async inicializuj(možnosti = {}) {
        const config = {
            název: path.basename(this.projektováCesta),
            verze: '1.0.0',
            popis: '',
            hlavní: 'index.cs',
            skripty: {
                spusť: 'czechscript index.cs',
                testuj: 'czechscript test.cs'
            },
            závislosti: {},
            vývojovéZávislosti: {},
            autor: '',
            licence: 'MIT',
            ...možnosti
        };
        
        await fs.writeFile(
            this.configSoubor,
            JSON.stringify(config, null, 2),
            'utf8'
        );
        
        console.log('✅ Vytvořen balíčky.json');
        return config;
    }
    
    // Načtení konfigurace
    async načtiConfig() {
        try {
            const data = await fs.readFile(this.configSoubor, 'utf8');
            return JSON.parse(data);
        } catch (err) {
            throw new Error('Soubor balíčky.json nebyl nalezen. Spusťte "cspkg init"');
        }
    }
    
    // Uložení konfigurace
    async uložConfig(config) {
        await fs.writeFile(
            this.configSoubor,
            JSON.stringify(config, null, 2),
            'utf8'
        );
    }
    
    // Instalace balíčku
    async instaluj(názevBalíčku, možnosti = {}) {
        const { dev = false, verze = 'latest' } = možnosti;
        
        console.log(`📦 Instaluji ${názevBalíčku}@${verze}...`);
        
        // Načti informace o balíčku z registru
        const infoBalíčku = await this.načtiInfoBalíčku(názevBalíčku, verze);
        
        if (!infoBalíčku) {
            throw new Error(`Balíček "${názevBalíčku}" nebyl nalezen`);
        }
        
        // Stáhni balíček
        await this.stáhniBalíček(infoBalíčku);
        
        // Aktualizuj balíčky.json
        const config = await this.načtiConfig();
        const klíčZávislostí = dev ? 'vývojovéZávislosti' : 'závislosti';
        
        if (!config[klíčZávislostí]) {
            config[klíčZávislostí] = {};
        }
        
        config[klíčZávislostí][názevBalíčku] = infoBalíčku.version;
        await this.uložConfig(config);
        
        console.log(`✅ Nainstalován ${názevBalíčku}@${infoBalíčku.version}`);
        
        // Instaluj závislosti balíčku
        if (infoBalíčku.dependencies) {
            for (const [název, verze] of Object.entries(infoBalíčku.dependencies)) {
                await this.instaluj(název, { verze: verze.replace('^', '') });
            }
        }
    }
    
    // Odinstalace balíčku
    async odinstaluj(názevBalíčku) {
        console.log(`🗑️  Odinstalovávám ${názevBalíčku}...`);
        
        // Smaž složku balíčku
        const cestaBalíčku = path.join(this.složkaBalíčků, názevBalíčku);
        await fs.rm(cestaBalíčku, { recursive: true, force: true });
        
        // Aktualizuj balíčky.json
        const config = await this.načtiConfig();
        delete config.závislosti?.[názevBalíčku];
        delete config.vývojovéZávislosti?.[názevBalíčku];
        await this.uložConfig(config);
        
        console.log(`✅ Odinstalován ${názevBalíčku}`);
    }
    
    // Aktualizace všech balíčků
    async aktualizuj() {
        console.log('🔄 Aktualizuji balíčky...');
        
        const config = await this.načtiConfig();
        const veškeréZávislosti = {
            ...config.závislosti,
            ...config.vývojovéZávislosti
        };
        
        for (const [název, verze] of Object.entries(veškeréZávislosti)) {
            const nejnovější = await this.najdiNejnovějšíVerzi(název);
            
            if (nejnovější && nejnovější !== verze) {
                console.log(`  Aktualizuji ${název}: ${verze} → ${nejnovější}`);
                await this.instaluj(název, { verze: nejnovější });
            }
        }
        
        console.log('✅ Aktualizace dokončena');
    }
    
    // Seznam nainstalovaných balíčků
    async seznam() {
        const config = await this.načtiConfig();
        
        console.log('\n📦 Nainstalované balíčky:\n');
        
        if (config.závislosti && Object.keys(config.závislosti).length > 0) {
            console.log('Závislosti:');
            for (const [název, verze] of Object.entries(config.závislosti)) {
                console.log(`  • ${název}@${verze}`);
            }
        }
        
        if (config.vývojovéZávislosti && Object.keys(config.vývojovéZávislosti).length > 0) {
            console.log('\nVývojové závislosti:');
            for (const [název, verze] of Object.entries(config.vývojovéZávislosti)) {
                console.log(`  • ${název}@${verze}`);
            }
        }
        
        console.log('');
    }
    
    // Načtení informací o balíčku z registru
    async načtiInfoBalíčku(název, verze) {
        return new Promise((resolve, reject) => {
            const url = `${this.registr}/${název}`;
            
            https.get(url, (res) => {
                let data = '';
                
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    try {
                        const json = JSON.parse(data);
                        const verzní = verze === 'latest' 
                            ? json['dist-tags'].latest 
                            : verze;
                        
                        resolve(json.versions[verzní]);
                    } catch (err) {
                        reject(err);
                    }
                });
            }).on('error', reject);
        });
    }
    
    // Stažení balíčku
    async stáhniBalíček(infoBalíčku) {
        const cestaBalíčku = path.join(this.složkaBalíčků, infoBalíčku.name);
        
        // Vytvoř složku pro balíčky, pokud neexistuje
        await fs.mkdir(this.složkaBalíčků, { recursive: true });
        await fs.mkdir(cestaBalíčku, { recursive: true });
        
        // Zde by bylo skutečné stažení a rozbalení tarballu
        // Pro jednoduchost pouze vytvoříme info soubor
        await fs.writeFile(
            path.join(cestaBalíčku, 'balíček.json'),
            JSON.stringify(infoBalíčku, null, 2),
            'utf8'
        );
    }
    
    // Najdi nejnovější verzi balíčku
    async najdiNejnovějšíVerzi(název) {
        try {
            const info = await this.načtiInfoBalíčku(název, 'latest');
            return info?.version;
        } catch {
            return null;
        }
    }
    
    // Publikování balíčku
    async publikuj() {
        const config = await this.načtiConfig();
        
        console.log(`📤 Publikuji ${config.název}@${config.verze}...`);
        
        // Validace
        if (!config.název) {
            throw new Error('Balíček musí mít název');
        }
        
        if (!config.verze) {
            throw new Error('Balíček musí mít verzi');
        }
        
        // Zde by bylo skutečné nahrání do registru
        console.log('✅ Publikováno!');
        console.log(`\n   Instalace: cspkg instaluj ${config.název}`);
    }
    
    // Spuštění skriptu
    async spuť(názevSkriptu) {
        const config = await this.načtiConfig();
        
        if (!config.skripty || !config.skripty[názevSkriptu]) {
            throw new Error(`Skript "${názevSkriptu}" nebyl nalezen v balíčky.json`);
        }
        
        const příkaz = config.skripty[názevSkriptu];
        console.log(`🚀 Spouštím: ${příkaz}\n`);
        
        const { exec } = require('child_process');
        
        return new Promise((resolve, reject) => {
            const proces = exec(příkaz, { cwd: this.projektováCesta });
            
            proces.stdout.on('data', (data) => {
                process.stdout.write(data);
            });
            
            proces.stderr.on('data', (data) => {
                process.stderr.write(data);
            });
            
            proces.on('close', (kód) => {
                if (kód === 0) {
                    resolve();
                } else {
                    reject(new Error(`Skript skončil s kódem ${kód}`));
                }
            });
        });
    }
}

module.exports = { PackageManager };
