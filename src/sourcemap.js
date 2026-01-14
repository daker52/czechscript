/**
 * CzechScript Source Maps Generator
 * Generování source maps pro debugging transpilovaného kódu
 */

class SourceMapGenerator {
    constructor(soubor, zdrojovýKód) {
        this.soubor = soubor;
        this.zdrojovýKód = zdrojovýKód;
        this.mapování = [];
        this.jména = [];
        this.zdroje = [soubor];
        this.zdrojovéKódy = [zdrojovýKód];
    }
    
    // Přidá mapování mezi pozicemi
    přidejMapování(generovanýŘádek, generovanýSloupec, zdrojovýŘádek, zdrojovýSloupec, jméno = null) {
        const mapování = {
            generovanýŘádek,
            generovanýSloupec,
            zdroj: 0, // index v this.zdroje
            zdrojovýŘádek,
            zdrojovýSloupec
        };
        
        if (jméno !== null) {
            let jménoIndex = this.jména.indexOf(jméno);
            if (jménoIndex === -1) {
                jménoIndex = this.jména.length;
                this.jména.push(jméno);
            }
            mapování.jméno = jménoIndex;
        }
        
        this.mapování.push(mapování);
    }
    
    // Zakóduje číslo pomocí VLQ (Variable Length Quantity)
    zakódujVLQ(hodnota) {
        const VLQ_BASE_SHIFT = 5;
        const VLQ_BASE = 1 << VLQ_BASE_SHIFT;
        const VLQ_BASE_MASK = VLQ_BASE - 1;
        const VLQ_CONTINUATION_BIT = VLQ_BASE;
        
        const base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
        
        let vlq = hodnota < 0 ? ((-hodnota) << 1) + 1 : hodnota << 1;
        let výsledek = '';
        
        do {
            let digit = vlq & VLQ_BASE_MASK;
            vlq >>>= VLQ_BASE_SHIFT;
            
            if (vlq > 0) {
                digit |= VLQ_CONTINUATION_BIT;
            }
            
            výsledek += base64Chars[digit];
        } while (vlq > 0);
        
        return výsledek;
    }
    
    // Generuje source map v3 formátu
    generuj() {
        // Seřadíme mapování podle pozice v generovaném kódu
        this.mapování.sort((a, b) => {
            if (a.generovanýŘádek !== b.generovanýŘádek) {
                return a.generovanýŘádek - b.generovanýŘádek;
            }
            return a.generovanýSloupec - b.generovanýSloupec;
        });
        
        // Generujeme VLQ enkódované mapování
        const řádky = [];
        let předchozíGenŘádek = 0;
        let předchozíGenSloupec = 0;
        let předchozíZdrojŘádek = 0;
        let předchozíZdrojSloupec = 0;
        let předchozíZdroj = 0;
        let předchozíJméno = 0;
        
        let aktuálníŘádek = '';
        
        for (const map of this.mapování) {
            if (map.generovanýŘádek > předchozíGenŘádek) {
                while (map.generovanýŘádek > předchozíGenŘádek) {
                    řádky.push(aktuálníŘádek);
                    aktuálníŘádek = '';
                    předchozíGenŘádek++;
                    předchozíGenSloupec = 0;
                }
            }
            
            if (aktuálníŘádek) aktuálníŘádek += ',';
            
            // Sloupec v generovaném kódu
            aktuálníŘádek += this.zakódujVLQ(map.generovanýSloupec - předchozíGenSloupec);
            předchozíGenSloupec = map.generovanýSloupec;
            
            // Index zdrojového souboru
            aktuálníŘádek += this.zakódujVLQ(map.zdroj - předchozíZdroj);
            předchozíZdroj = map.zdroj;
            
            // Řádek ve zdrojovém kódu
            aktuálníŘádek += this.zakódujVLQ(map.zdrojovýŘádek - předchozíZdrojŘádek);
            předchozíZdrojŘádek = map.zdrojovýŘádek;
            
            // Sloupec ve zdrojovém kódu
            aktuálníŘádek += this.zakódujVLQ(map.zdrojovýSloupec - předchozíZdrojSloupec);
            předchozíZdrojSloupec = map.zdrojovýSloupec;
            
            // Jméno (volitelné)
            if (map.jméno !== undefined) {
                aktuálníŘádek += this.zakódujVLQ(map.jméno - předchozíJméno);
                předchozíJméno = map.jméno;
            }
        }
        
        řádky.push(aktuálníŘádek);
        
        return {
            version: 3,
            file: this.soubor.replace('.cs', '.js'),
            sourceRoot: '',
            sources: this.zdroje,
            sourcesContent: this.zdrojovéKódy,
            names: this.jména,
            mappings: řádky.join(';')
        };
    }
    
    // Uloží source map do souboru
    async ulož(výstupníSoubor) {
        const sourceMap = this.generuj();
        const json = JSON.stringify(sourceMap, null, 2);
        
        if (typeof require !== 'undefined') {
            const fs = require('fs').promises;
            await fs.writeFile(výstupníSoubor, json, 'utf8');
        }
        
        return json;
    }
    
    // Vrátí source map jako inline base64
    inline() {
        const sourceMap = this.generuj();
        const json = JSON.stringify(sourceMap);
        
        if (typeof Buffer !== 'undefined') {
            return 'data:application/json;charset=utf-8;base64,' + 
                   Buffer.from(json).toString('base64');
        } else {
            return 'data:application/json;charset=utf-8;base64,' + btoa(json);
        }
    }
}

// Enhanced CodeGenerator s podporou source maps
class CodeGeneratorWithSourceMaps {
    constructor(ast, zdrojovýSoubor, zdrojovýKód) {
        this.ast = ast;
        this.zdrojovýSoubor = zdrojovýSoubor;
        this.zdrojovýKód = zdrojovýKód;
        this.sourceMapGenerator = new SourceMapGenerator(zdrojovýSoubor, zdrojovýKód);
        this.generovanýKód = '';
        this.aktuálníŘádek = 0;
        this.aktuálníSloupec = 0;
        this.odsazení = 0;
    }
    
    // Přidá kód a aktualizuje pozici
    emit(kód, zdrojováPozice = null) {
        if (zdrojováPozice) {
            this.sourceMapGenerator.přidejMapování(
                this.aktuálníŘádek,
                this.aktuálníSloupec,
                zdrojováPozice.line - 1,
                zdrojováPozice.column,
                zdrojováPozice.name
            );
        }
        
        this.generovanýKód += kód;
        
        // Aktualizuj pozici
        const řádky = kód.split('\n');
        if (řádky.length > 1) {
            this.aktuálníŘádek += řádky.length - 1;
            this.aktuálníSloupec = řádky[řádky.length - 1].length;
        } else {
            this.aktuálníSloupec += kód.length;
        }
    }
    
    emitLine(kód, zdrojováPozice = null) {
        this.emit(kód + '\n', zdrojováPozice);
    }
    
    generuj() {
        // Generování kódu s mapováním
        // (zde by byla plná implementace podobná CodeGenerator.js)
        
        return {
            kód: this.generovanýKód,
            sourceMap: this.sourceMapGenerator.generuj()
        };
    }
}

module.exports = {
    SourceMapGenerator,
    CodeGeneratorWithSourceMaps
};
