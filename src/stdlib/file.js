/**
 * CzechScript Standard Library - File System Module
 * Funkce pro práci se soubory a složkami (Node.js)
 */

const fs = require('fs');
const path = require('path');

const CzechFS = {
    // Čtení souborů
    async přečtiSoubor(cesta, kódování = 'utf8') {
        return fs.promises.readFile(cesta, kódování);
    },
    
    přečtiSouborSync(cesta, kódování = 'utf8') {
        return fs.readFileSync(cesta, kódování);
    },
    
    async přečtiJSON(cesta) {
        const obsah = await this.přečtiSoubor(cesta);
        return JSON.parse(obsah);
    },
    
    přečtiJSONSync(cesta) {
        const obsah = this.přečtiSouborSync(cesta);
        return JSON.parse(obsah);
    },
    
    async přečtiŘádky(cesta, kódování = 'utf8') {
        const obsah = await this.přečtiSoubor(cesta, kódování);
        return obsah.split('\n');
    },
    
    // Zápis souborů
    async zapisSoubor(cesta, obsah, kódování = 'utf8') {
        return fs.promises.writeFile(cesta, obsah, kódování);
    },
    
    zapisSouborSync(cesta, obsah, kódování = 'utf8') {
        return fs.writeFileSync(cesta, obsah, kódování);
    },
    
    async zapisJSON(cesta, data, odsadit = 2) {
        const json = JSON.stringify(data, null, odsadit);
        return this.zapisSoubor(cesta, json);
    },
    
    zapisJSONSync(cesta, data, odsadit = 2) {
        const json = JSON.stringify(data, null, odsadit);
        return this.zapisSouborSync(cesta, json);
    },
    
    async připoj(cesta, obsah, kódování = 'utf8') {
        return fs.promises.appendFile(cesta, obsah, kódování);
    },
    
    připojSync(cesta, obsah, kódování = 'utf8') {
        return fs.appendFileSync(cesta, obsah, kódování);
    },
    
    // Kopírování a přesouvání
    async kopíruj(zdroj, cíl) {
        return fs.promises.copyFile(zdroj, cíl);
    },
    
    kopírujSync(zdroj, cíl) {
        return fs.copyFileSync(zdroj, cíl);
    },
    
    async přesuň(zdroj, cíl) {
        return fs.promises.rename(zdroj, cíl);
    },
    
    přesněSync(zdroj, cíl) {
        return fs.renameSync(zdroj, cíl);
    },
    
    // Mazání
    async smaž(cesta) {
        return fs.promises.unlink(cesta);
    },
    
    smažSync(cesta) {
        return fs.unlinkSync(cesta);
    },
    
    async smažSložku(cesta, rekurzivně = false) {
        return fs.promises.rmdir(cesta, { recursive: rekurzivně });
    },
    
    smažSložkuSync(cesta, rekurzivně = false) {
        return fs.rmdirSync(cesta, { recursive: rekurzivně });
    },
    
    // Složky
    async vytvořSložku(cesta, rekurzivně = true) {
        return fs.promises.mkdir(cesta, { recursive: rekurzivně });
    },
    
    vytvořSložkuSync(cesta, rekurzivně = true) {
        return fs.mkdirSync(cesta, { recursive: rekurzivně });
    },
    
    async načtiSložku(cesta, sDetaily = false) {
        if (sDetaily) {
            return fs.promises.readdir(cesta, { withFileTypes: true });
        }
        return fs.promises.readdir(cesta);
    },
    
    načtiSložkuSync(cesta, sDetaily = false) {
        if (sDetaily) {
            return fs.readdirSync(cesta, { withFileTypes: true });
        }
        return fs.readdirSync(cesta);
    },
    
    // Informace o souboru
    async info(cesta) {
        return fs.promises.stat(cesta);
    },
    
    infoSync(cesta) {
        return fs.statSync(cesta);
    },
    
    async existuje(cesta) {
        try {
            await fs.promises.access(cesta);
            return true;
        } catch {
            return false;
        }
    },
    
    existujeSync(cesta) {
        return fs.existsSync(cesta);
    },
    
    async jeSoubor(cesta) {
        try {
            const stats = await this.info(cesta);
            return stats.isFile();
        } catch {
            return false;
        }
    },
    
    jeSouborSync(cesta) {
        try {
            const stats = this.infoSync(cesta);
            return stats.isFile();
        } catch {
            return false;
        }
    },
    
    async jeSložka(cesta) {
        try {
            const stats = await this.info(cesta);
            return stats.isDirectory();
        } catch {
            return false;
        }
    },
    
    jeSložkaSync(cesta) {
        try {
            const stats = this.infoSync(cesta);
            return stats.isDirectory();
        } catch {
            return false;
        }
    },
    
    // Cesty
    spojCesty(...části) {
        return path.join(...části);
    },
    
    absolutníCesta(cesta) {
        return path.resolve(cesta);
    },
    
    relativníCesta(od, k) {
        return path.relative(od, k);
    },
    
    složka(cesta) {
        return path.dirname(cesta);
    },
    
    názevSouboru(cesta, bezPřípony = false) {
        if (bezPřípony) {
            return path.basename(cesta, path.extname(cesta));
        }
        return path.basename(cesta);
    },
    
    přípona(cesta) {
        return path.extname(cesta);
    },
    
    parsujCestu(cesta) {
        return path.parse(cesta);
    },
    
    // Sledování změn
    sleduj(cesta, callback, možnosti = {}) {
        const watcher = fs.watch(cesta, možnosti, (typ, jménoSouboru) => {
            callback({
                typ,
                soubor: jménoSouboru,
                cesta: path.join(cesta, jménoSouboru || '')
            });
        });
        
        return {
            zastaví: () => watcher.close()
        };
    },
    
    // Pokročilé operace
    async najdiSoubory(složka, vzor, rekurzivně = true) {
        const výsledky = [];
        const položky = await this.načtiSložku(složka, true);
        
        for (const položka of položky) {
            const celaCesta = path.join(složka, položka.name);
            
            if (položka.isDirectory() && rekurzivně) {
                const podvýsledky = await this.najdiSoubory(celaCesta, vzor, rekurzivně);
                výsledky.push(...podvýsledky);
            } else if (položka.isFile()) {
                if (typeof vzor === 'string') {
                    if (položka.name.includes(vzor)) {
                        výsledky.push(celaCesta);
                    }
                } else if (vzor instanceof RegExp) {
                    if (vzor.test(položka.name)) {
                        výsledky.push(celaCesta);
                    }
                } else if (typeof vzor === 'function') {
                    if (vzor(položka.name, celaCesta)) {
                        výsledky.push(celaCesta);
                    }
                }
            }
        }
        
        return výsledky;
    },
    
    async velikostSložky(cesta) {
        let celkem = 0;
        const položky = await this.načtiSložku(cesta, true);
        
        for (const položka of položky) {
            const celaCesta = path.join(cesta, položka.name);
            
            if (položka.isDirectory()) {
                celkem += await this.velikostSložky(celaCesta);
            } else {
                const stats = await this.info(celaCesta);
                celkem += stats.size;
            }
        }
        
        return celkem;
    },
    
    formátujVelikost(bajty) {
        const jednotky = ['B', 'KB', 'MB', 'GB', 'TB'];
        let i = 0;
        
        while (bajty >= 1024 && i < jednotky.length - 1) {
            bajty /= 1024;
            i++;
        }
        
        return `${bajty.toFixed(2)} ${jednotky[i]}`;
    },
    
    // Dočasné soubory
    async vytvořDočasný(prefix = 'tmp-', přípona = '.tmp') {
        const os = require('os');
        const tempDir = os.tmpdir();
        const náhodnéJméno = prefix + Date.now() + '-' + Math.random().toString(36).substr(2, 9) + přípona;
        const cesta = path.join(tempDir, náhodnéJméno);
        
        await this.zapisSoubor(cesta, '');
        return cesta;
    },
    
    // Stream operace
    vytvořReadStream(cesta, možnosti = {}) {
        return fs.createReadStream(cesta, možnosti);
    },
    
    vytvořWriteStream(cesta, možnosti = {}) {
        return fs.createWriteStream(cesta, možnosti);
    },
    
    async kopírujVelkýSoubor(zdroj, cíl) {
        return new Promise((resolve, reject) => {
            const readStream = this.vytvořReadStream(zdroj);
            const writeStream = this.vytvořWriteStream(cíl);
            
            readStream.on('error', reject);
            writeStream.on('error', reject);
            writeStream.on('finish', resolve);
            
            readStream.pipe(writeStream);
        });
    }
};

module.exports = CzechFS;
