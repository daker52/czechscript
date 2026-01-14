/**
 * CzechScript Documentation Generator
 * Automatické generování dokumentace z komentářů
 */

const fs = require('fs').promises;
const path = require('path');
const { Parser } = require('./parser');

class DocumentationGenerator {
    constructor(možnosti = {}) {
        this.možnosti = {
            formát: 'markdown', // markdown, html, json
            výstup: 'docs',
            včetněSoukromých: false,
            šablona: 'default',
            ...možnosti
        };
        
        this.dokumentace = {
            projekt: {},
            soubory: [],
            funkce: [],
            třídy: [],
            proměnné: []
        };
    }
    
    // Generování dokumentace
    async generuj(vstupníCesta) {
        console.log('📚 Generuji dokumentaci...\n');
        
        const začátek = Date.now();
        
        // Načti všechny .cs soubory
        const soubory = await this.najdiSoubory(vstupníCesta, '.cs');
        console.log(`📁 Nalezeno ${soubory.length} souborů`);
        
        // Parsuj každý soubor
        for (const soubor of soubory) {
            await this.parsujSoubor(soubor);
        }
        
        // Generuj výstupní dokumentaci
        const výstup = this.formátujDokumentaci();
        
        // Ulož do souboru
        await this.ulož(výstup);
        
        const konec = Date.now();
        
        console.log('\n✅ Dokumentace vygenerována!');
        console.log(`   📂 Výstup: ${this.možnosti.výstup}`);
        console.log(`   ⏱  Čas: ${konec - začátek}ms`);
        
        return výstup;
    }
    
    // Najdi všechny soubory s příponou
    async najdiSoubory(složka, přípona) {
        const soubory = [];
        
        async function hledej(aktuálníSložka) {
            const položky = await fs.readdir(aktuálníSložka, { withFileTypes: true });
            
            for (const položka of položky) {
                const celaCesta = path.join(aktuálníSložka, položka.name);
                
                if (položka.isDirectory()) {
                    if (!položka.name.startsWith('.') && položka.name !== 'node_modules') {
                        await hledej(celaCesta);
                    }
                } else if (položka.name.endsWith(přípona)) {
                    soubory.push(celaCesta);
                }
            }
        }
        
        await hledej(složka);
        return soubory;
    }
    
    // Parsuj soubor a extrahuj dokumentaci
    async parsujSoubor(cesta) {
        const obsah = await fs.readFile(cesta, 'utf8');
        const parser = new Parser();
        
        try {
            const ast = parser.parse(obsah);
            const relativníCesta = path.relative(process.cwd(), cesta);
            
            const souborInfo = {
                cesta: relativníCesta,
                funkce: [],
                třídy: [],
                proměnné: []
            };
            
            this.extrahujDokumentaci(ast, souborInfo, obsah);
            this.dokumentace.soubory.push(souborInfo);
            
        } catch (err) {
            console.warn(`⚠️  Varování: ${path.basename(cesta)} - ${err.message}`);
        }
    }
    
    // Extrahuj dokumentaci z AST
    extrahujDokumentaci(uzel, souborInfo, zdrojovýKód) {
        if (!uzel || !uzel.type) return;
        
        const řádky = zdrojovýKód.split('\n');
        
        // Funkce
        if (uzel.type === 'FunctionDeclaration' && uzel.id) {
            const doc = this.extrahujKomentář(uzel, řádky);
            
            const funkceInfo = {
                název: uzel.id.name,
                parametry: uzel.params?.map(p => ({
                    název: p.name,
                    typ: p.typeAnnotation || 'any'
                })) || [],
                návratovýTyp: uzel.returnType || 'void',
                popis: doc.popis,
                příklady: doc.příklady,
                řádek: uzel.location?.line
            };
            
            souborInfo.funkce.push(funkceInfo);
            this.dokumentace.funkce.push({
                ...funkceInfo,
                soubor: souborInfo.cesta
            });
        }
        
        // Třídy
        if (uzel.type === 'ClassDeclaration' && uzel.id) {
            const doc = this.extrahujKomentář(uzel, řádky);
            
            const třídaInfo = {
                název: uzel.id.name,
                rozšiřuje: uzel.superClass?.name,
                metody: [],
                vlastnosti: [],
                popis: doc.popis,
                řádek: uzel.location?.line
            };
            
            // Extrahuj metody
            uzel.body?.body?.forEach(člen => {
                if (člen.type === 'MethodDefinition' && člen.key) {
                    const metodaDoc = this.extrahujKomentář(člen, řádky);
                    
                    třídaInfo.metody.push({
                        název: člen.key.name,
                        parametry: člen.value?.params?.map(p => p.name) || [],
                        popis: metodaDoc.popis
                    });
                }
            });
            
            souborInfo.třídy.push(třídaInfo);
            this.dokumentace.třídy.push({
                ...třídaInfo,
                soubor: souborInfo.cesta
            });
        }
        
        // Proměnné a konstanty
        if (uzel.type === 'VariableDeclaration') {
            uzel.declarations?.forEach(decl => {
                if (decl.id) {
                    const doc = this.extrahujKomentář(uzel, řádky);
                    
                    const proměnnáInfo = {
                        název: decl.id.name,
                        typ: decl.typeAnnotation || 'any',
                        konstanta: uzel.kind === 'konstanta',
                        popis: doc.popis,
                        řádek: uzel.location?.line
                    };
                    
                    souborInfo.proměnné.push(proměnnáInfo);
                }
            });
        }
        
        // Rekurze
        for (const klíč in uzel) {
            if (Array.isArray(uzel[klíč])) {
                uzel[klíč].forEach(dítě => this.extrahujDokumentaci(dítě, souborInfo, zdrojovýKód));
            } else if (uzel[klíč] && typeof uzel[klíč] === 'object') {
                this.extrahujDokumentaci(uzel[klíč], souborInfo, zdrojovýKód);
            }
        }
    }
    
    // Extrahuj dokumentační komentář před uzlem
    extrahujKomentář(uzel, řádky) {
        if (!uzel.location) return { popis: '', příklady: [] };
        
        const řádek = uzel.location.line - 1;
        const komentáře = [];
        
        // Hledej komentáře nad uzlem
        for (let i = řádek - 1; i >= 0; i--) {
            const řádkaText = řádky[i].trim();
            
            if (řádkaText.startsWith('//')) {
                komentáře.unshift(řádkaText.slice(2).trim());
            } else if (řádkaText.startsWith('/*') || řádkaText.startsWith('*')) {
                komentáře.unshift(řádkaText.replace(/^\/?\*+\/?/, '').trim());
            } else if (řádkaText.length > 0) {
                break;
            }
        }
        
        // Parsuj komentáře
        const popis = [];
        const příklady = [];
        let vPříkladu = false;
        
        komentáře.forEach(řádka => {
            if (řádka.startsWith('@příklad')) {
                vPříkladu = true;
            } else if (vPříkladu) {
                příklady.push(řádka);
            } else if (řádka && !řádka.startsWith('@')) {
                popis.push(řádka);
            }
        });
        
        return {
            popis: popis.join(' '),
            příklady
        };
    }
    
    // Formátuj dokumentaci podle zvoleného formátu
    formátujDokumentaci() {
        if (this.možnosti.formát === 'markdown') {
            return this.formátujMarkdown();
        } else if (this.možnosti.formát === 'html') {
            return this.formátujHTML();
        } else if (this.možnosti.formát === 'json') {
            return JSON.stringify(this.dokumentace, null, 2);
        }
    }
    
    // Formátuj jako Markdown
    formátujMarkdown() {
        let md = '# CzechScript Dokumentace\n\n';
        md += `Vygenerováno: ${new Date().toLocaleString('cs-CZ')}\n\n`;
        md += '---\n\n';
        
        // Obsah
        md += '## 📋 Obsah\n\n';
        md += '- [Funkce](#funkce)\n';
        md += '- [Třídy](#třídy)\n';
        md += '- [Soubory](#soubory)\n\n';
        md += '---\n\n';
        
        // Funkce
        md += '## 🔧 Funkce\n\n';
        
        this.dokumentace.funkce.forEach(fn => {
            md += `### \`${fn.název}(${fn.parametry.map(p => p.název).join(', ')})\`\n\n`;
            
            if (fn.popis) {
                md += `${fn.popis}\n\n`;
            }
            
            if (fn.parametry.length > 0) {
                md += '**Parametry:**\n\n';
                fn.parametry.forEach(p => {
                    md += `- \`${p.název}\` (${p.typ})\n`;
                });
                md += '\n';
            }
            
            md += `**Návratový typ:** \`${fn.návratovýTyp}\`\n\n`;
            md += `**Soubor:** \`${fn.soubor}\`\n\n`;
            
            if (fn.příklady.length > 0) {
                md += '**Příklad:**\n\n```czechscript\n';
                md += fn.příklady.join('\n');
                md += '\n```\n\n';
            }
            
            md += '---\n\n';
        });
        
        // Třídy
        md += '## 🏛️ Třídy\n\n';
        
        this.dokumentace.třídy.forEach(cls => {
            md += `### \`${cls.název}\`\n\n`;
            
            if (cls.popis) {
                md += `${cls.popis}\n\n`;
            }
            
            if (cls.rozšiřuje) {
                md += `**Rozšiřuje:** \`${cls.rozšiřuje}\`\n\n`;
            }
            
            if (cls.metody.length > 0) {
                md += '**Metody:**\n\n';
                cls.metody.forEach(m => {
                    md += `- \`${m.název}(${m.parametry.join(', ')})\``;
                    if (m.popis) {
                        md += ` - ${m.popis}`;
                    }
                    md += '\n';
                });
                md += '\n';
            }
            
            md += `**Soubor:** \`${cls.soubor}\`\n\n`;
            md += '---\n\n';
        });
        
        // Soubory
        md += '## 📁 Soubory\n\n';
        
        this.dokumentace.soubory.forEach(soubor => {
            md += `### \`${soubor.cesta}\`\n\n`;
            md += `- Funkce: ${soubor.funkce.length}\n`;
            md += `- Třídy: ${soubor.třídy.length}\n`;
            md += `- Proměnné: ${soubor.proměnné.length}\n\n`;
        });
        
        return md;
    }
    
    // Formátuj jako HTML
    formátujHTML() {
        let html = `<!DOCTYPE html>
<html lang="cs">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CzechScript Dokumentace</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            border-radius: 12px;
            margin-bottom: 30px;
        }
        .function, .class {
            background: white;
            padding: 20px;
            margin-bottom: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        code {
            background: #f0f0f0;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
        }
        .params {
            background: #f9f9f9;
            padding: 10px;
            border-left: 3px solid #667eea;
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚀 CzechScript Dokumentace</h1>
        <p>Vygenerováno: ${new Date().toLocaleString('cs-CZ')}</p>
    </div>
`;
        
        // Funkce
        html += '<h2>🔧 Funkce</h2>\n';
        
        this.dokumentace.funkce.forEach(fn => {
            html += `<div class="function">
    <h3>${fn.název}(${fn.parametry.map(p => p.název).join(', ')})</h3>
    <p>${fn.popis || 'Bez popisu'}</p>
    <div class="params">
        <strong>Parametry:</strong>
        <ul>
            ${fn.parametry.map(p => `<li><code>${p.název}</code> (${p.typ})</li>`).join('')}
        </ul>
    </div>
    <p><strong>Návrat:</strong> <code>${fn.návratovýTyp}</code></p>
    <p><small>Soubor: <code>${fn.soubor}</code></small></p>
</div>\n`;
        });
        
        html += '</body></html>';
        
        return html;
    }
    
    // Ulož dokumentaci
    async ulož(obsah) {
        await fs.mkdir(this.možnosti.výstup, { recursive: true });
        
        const přípona = this.možnosti.formát === 'markdown' ? 'md'
            : this.možnosti.formát === 'html' ? 'html'
            : 'json';
        
        const cesta = path.join(this.možnosti.výstup, `dokumentace.${přípona}`);
        
        await fs.writeFile(cesta, obsah, 'utf8');
        console.log(`   💾 Uloženo: ${cesta}`);
    }
}

module.exports = { DocumentationGenerator };
