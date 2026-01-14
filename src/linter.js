/**
 * CzechScript Linter
 * Kontrola kvality kódu a best practices
 */

class CzechScriptLinter {
    constructor(možnosti = {}) {
        this.možnosti = {
            maxDélkaŘádku: 100,
            maxVnoření: 4,
            maxParametrů: 5,
            maxDélkaFunkce: 50,
            ...možnosti
        };
        this.problémy = [];
    }
    
    kontroluj(ast, zdrojovýKód) {
        this.problémy = [];
        this.zdrojovýKód = zdrojovýKód;
        this.řádky = zdrojovýKód.split('\n');
        
        this.navštiv(ast, 0);
        
        return this.problémy;
    }
    
    navštiv(uzel, úrověň = 0) {
        if (!uzel || !uzel.type) return;
        
        // Kontrola vnoření
        if (úrověň > this.možnosti.maxVnoření) {
            this.přidejProblém(uzel, 'warning', 
                `Příliš hluboké vnoření (${úrověň}). Zkuste refaktorovat kód.`
            );
        }
        
        // Kontrola podle typu uzlu
        switch (uzel.type) {
            case 'FunctionDeclaration':
                this.kontrolujFunkci(uzel);
                break;
            case 'VariableDeclaration':
                this.kontrolujProměnnou(uzel);
                break;
            case 'BinaryExpression':
                this.kontrolujBinárníOperátor(uzel);
                break;
            case 'IfStatement':
                this.kontrolujIf(uzel);
                break;
            case 'ForStatement':
            case 'WhileStatement':
                this.kontrolujSmyčku(uzel);
                break;
            case 'SwitchStatement':
                this.kontrolujSwitch(uzel);
                break;
            case 'TryStatement':
                this.kontrolujTry(uzel);
                break;
        }
        
        // Rekurzivně procházej dětské uzly
        this.navštivDěti(uzel, úroveň + 1);
    }
    
    navštivDěti(uzel, úroveň) {
        for (const klíč in uzel) {
            if (klíč === 'location' || klíč === 'type') continue;
            
            const hodnota = uzel[klíč];
            
            if (Array.isArray(hodnota)) {
                hodnota.forEach(dítě => this.navštiv(dítě, úroveň));
            } else if (hodnota && typeof hodnota === 'object') {
                this.navštiv(hodnota, úroveň);
            }
        }
    }
    
    kontrolujFunkci(uzel) {
        // Kontrola počtu parametrů
        if (uzel.params && uzel.params.length > this.možnosti.maxParametrů) {
            this.přidejProblém(uzel, 'warning',
                `Funkce má příliš mnoho parametrů (${uzel.params.length}). ` +
                `Zvažte použití objektu.`
            );
        }
        
        // Kontrola délky funkce
        if (uzel.body && uzel.body.body) {
            const délka = uzel.body.body.length;
            if (délka > this.možnosti.maxDélkaFunkce) {
                this.přidejProblém(uzel, 'warning',
                    `Funkce je příliš dlouhá (${délka} příkazů). ` +
                    `Zvažte rozdělení na menší funkce.`
                );
            }
        }
        
        // Kontrola názvu funkce
        if (uzel.id && uzel.id.name) {
            if (!/^[a-záčďéěíňóřšťúůýž][a-záčďéěíňóřšťúůýžA-Z0-9]*$/.test(uzel.id.name)) {
                this.přidejProblém(uzel, 'error',
                    `Neplatný název funkce "${uzel.id.name}". ` +
                    `Použijte camelCase s českými znaky.`
                );
            }
        }
    }
    
    kontrolujProměnnou(uzel) {
        // Kontrola názvu proměnné
        if (uzel.declarations) {
            uzel.declarations.forEach(deklarace => {
                if (deklarace.id && deklarace.id.name) {
                    const název = deklarace.id.name;
                    
                    // Kontrola pojmenování
                    if (!/^[a-záčďéěíňóřšťúůýž][a-záčďéěíňóřšťúůýžA-Z0-9]*$/.test(název)) {
                        this.přidejProblém(deklarace, 'warning',
                            `Nekonvenční název proměnné "${název}"`
                        );
                    }
                    
                    // Kontrola jednoho písmena
                    if (název.length === 1 && !['i', 'j', 'k', 'x', 'y', 'z'].includes(název)) {
                        this.přidejProblém(deklarace, 'warning',
                            `Název proměnné je příliš krátký: "${název}"`
                        );
                    }
                    
                    // Kontrola inicializace
                    if (uzel.kind === 'konstanta' && !deklarace.init) {
                        this.přidejProblém(deklarace, 'error',
                            `Konstanta "${název}" musí být inicializována`
                        );
                    }
                }
            });
        }
    }
    
    kontrolujBinárníOperátor(uzel) {
        // Kontrola porovnání s true/false
        if (uzel.operator === '===' || uzel.operator === '!==') {
            if (this.jeLiterálBool(uzel.right) || this.jeLiterálBool(uzel.left)) {
                this.přidejProblém(uzel, 'warning',
                    'Zbytečné porovnání s true/false. Použijte přímo podmínku.'
                );
            }
        }
        
        // Kontrola použití == místo ===
        if (uzel.operator === '==' || uzel.operator === '!=') {
            this.přidejProblém(uzel, 'warning',
                `Použijte === nebo !== místo ${uzel.operator} pro přesné porovnání`
            );
        }
    }
    
    kontrolujIf(uzel) {
        // Kontrola prázdného then bloku
        if (uzel.consequent && uzel.consequent.body && uzel.consequent.body.length === 0) {
            this.přidejProblém(uzel, 'warning', 'Prázdný if blok');
        }
        
        // Kontrola negace v podmínce
        if (uzel.test && uzel.test.type === 'UnaryExpression' && uzel.test.operator === '!') {
            if (uzel.alternate) {
                this.přidejProblém(uzel, 'info',
                    'Zvažte prohození if a jinak větví místo negace'
                );
            }
        }
    }
    
    kontrolujSmyčku(uzel) {
        // Kontrola nekonečné smyčky
        if (uzel.type === 'WhileStatement' && 
            uzel.test && 
            uzel.test.type === 'Literal' && 
            uzel.test.value === true) {
            this.přidejProblém(uzel, 'warning', 
                'Možná nekonečná smyčka. Ujistěte se, že je podmínka ukončení uvnitř.'
            );
        }
    }
    
    kontrolujSwitch(uzel) {
        // Kontrola default větve
        const máDefault = uzel.cases.some(c => c.test === null);
        if (!máDefault) {
            this.přidejProblém(uzel, 'warning',
                'Switch nemá default větev. Zvažte její přidání.'
            );
        }
        
        // Kontrola fall-through
        uzel.cases.forEach((kasus, index) => {
            if (index < uzel.cases.length - 1 && 
                kasus.consequent.length > 0 &&
                !this.končíPříkazem(kasus.consequent, ['break', 'return', 'throw'])) {
                this.přidejProblém(kasus, 'warning',
                    'Case větev neobsahuje break. Fall-through záměrný?'
                );
            }
        });
    }
    
    kontrolujTry(uzel) {
        // Kontrola prázdného catch
        if (uzel.handler && 
            uzel.handler.body && 
            uzel.handler.body.body.length === 0) {
            this.přidejProblém(uzel.handler, 'warning',
                'Prázdný catch blok - chyby jsou ignorovány'
            );
        }
    }
    
    // Pomocné funkce
    jeLiterálBool(uzel) {
        return uzel && uzel.type === 'Literal' && typeof uzel.value === 'boolean';
    }
    
    končíPříkazem(příkazy, typy) {
        if (příkazy.length === 0) return false;
        const poslední = příkazy[příkazy.length - 1];
        return typy.includes(poslední.type.replace('Statement', '').toLowerCase());
    }
    
    přidejProblém(uzel, závažnost, zpráva) {
        this.problémy.push({
            závažnost, // 'error', 'warning', 'info'
            zpráva,
            řádek: uzel.location?.line || 0,
            sloupec: uzel.location?.column || 0,
            kód: this.řádky[uzel.location?.line - 1] || ''
        });
    }
    
    formátujVýstup() {
        const skupiny = {
            error: [],
            warning: [],
            info: []
        };
        
        this.problémy.forEach(p => {
            skupiny[p.závažnost].push(p);
        });
        
        let výstup = '\n';
        
        if (skupiny.error.length > 0) {
            výstup += '❌ Chyby:\n';
            skupiny.error.forEach(p => {
                výstup += `   ${p.řádek}:${p.sloupec} - ${p.zpráva}\n`;
            });
            výstup += '\n';
        }
        
        if (skupiny.warning.length > 0) {
            výstup += '⚠️  Varování:\n';
            skupiny.warning.forEach(p => {
                výstup += `   ${p.řádek}:${p.sloupec} - ${p.zpráva}\n`;
            });
            výstup += '\n';
        }
        
        if (skupiny.info.length > 0) {
            výstup += 'ℹ️  Info:\n';
            skupiny.info.forEach(p => {
                výstup += `   ${p.řádek}:${p.sloupec} - ${p.zpráva}\n`;
            });
            výstup += '\n';
        }
        
        const celkem = this.problémy.length;
        const chyby = skupiny.error.length;
        const varování = skupiny.warning.length;
        
        výstup += `📊 Celkem: ${celkem} problémů (${chyby} chyb, ${varování} varování)\n`;
        
        return výstup;
    }
}

module.exports = { CzechScriptLinter };
