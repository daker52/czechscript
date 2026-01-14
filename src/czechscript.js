/**
 * CzechScript Engine
 * Open-source programovací jazyk s českou syntaxí
 * @version 1.0.0
 * @author Ondřej Hak
 */

class CzechScript {
    constructor() {
        this.tokens = [];
        this.ast = null;
        this.scope = {};
        
        // Mapa českých klíčových slov na JavaScript
        this.keywords = {
            'proměnná': 'let',
            'konstanta': 'const',
            'když': 'if',
            'pak': '',
            'jinak': 'else',
            'opakuj': 'for',
            'dokud': 'while',
            'pro_každý': 'for',
            'funkce': 'function',
            'vrať': 'return',
            'vypis': 'console.log',
            'upozornění': 'alert',
            'potvrď': 'confirm',
            'dotaz': 'prompt',
            'pravda': 'true',
            'nepravda': 'false',
            'null': 'null',
            'nedefinováno': 'undefined',
            'nový': 'new',
            'třída': 'class',
            'tento': 'this',
            'rozšiřuje': 'extends',
            'konstruktor': 'constructor',
            'importuj': 'import',
            'exportuj': 'export',
            'async': 'async',
            'await': 'await',
            'zkus': 'try',
            'chyť': 'catch',
            'nakonec': 'finally',
            'hoď': 'throw',
            'v': 'of',
            'z': 'from',
            'jako': 'as'
        };
        
        // Operátory
        this.operators = {
            'a': '&&',
            'nebo': '||',
            'ne': '!',
            'rovno': '===',
            'nerovno': '!==',
            'větší': '>',
            'menší': '<',
            'větší_rovno': '>=',
            'menší_rovno': '<=',
            'plus': '+',
            'mínus': '-',
            'krát': '*',
            'děleno': '/',
            'modulo': '%',
            'mocnina': '**'
        };
        
        // DOM a Web API funkce
        this.webAPI = {
            'prvek': 'document.querySelector',
            'prvky': 'document.querySelectorAll',
            'načti_data': 'fetch',
            'počkej': 'setTimeout',
            'opakuj_každou': 'setInterval',
            'zastavy_opakování': 'clearInterval',
            'vytvořelement': 'document.createElement',
            'lokální_úložiště': 'localStorage',
            'session_úložiště': 'sessionStorage'
        };
    }
    
    /**
     * Lexikální analýza - tokenizace
     */
    tokenize(code) {
        this.tokens = [];
        let current = 0;
        
        while (current < code.length) {
            let char = code[current];
            
            // Whitespace
            if (/\s/.test(char)) {
                current++;
                continue;
            }
            
            // Komentáře
            if (char === '/' && code[current + 1] === '/') {
                while (code[current] !== '\n' && current < code.length) {
                    current++;
                }
                continue;
            }
            
            // Víceřádkové komentáře
            if (char === '/' && code[current + 1] === '*') {
                while (!(code[current] === '*' && code[current + 1] === '/') && current < code.length) {
                    current++;
                }
                current += 2;
                continue;
            }
            
            // Stringy
            if (char === '"' || char === "'" || char === '`') {
                let quote = char;
                let value = '';
                current++;
                
                while (code[current] !== quote && current < code.length) {
                    if (code[current] === '\\') {
                        current++;
                    }
                    value += code[current];
                    current++;
                }
                
                this.tokens.push({ type: 'string', value });
                current++;
                continue;
            }
            
            // Čísla
            if (/[0-9]/.test(char)) {
                let value = '';
                while (/[0-9.]/.test(code[current]) && current < code.length) {
                    value += code[current];
                    current++;
                }
                this.tokens.push({ type: 'number', value: parseFloat(value) });
                continue;
            }
            
            // Identifikátory a klíčová slova
            if (/[a-záčďéěíňóřšťúůýžA-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ_]/.test(char)) {
                let value = '';
                while (/[a-záčďéěíňóřšťúůýžA-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ0-9_]/.test(code[current]) && current < code.length) {
                    value += code[current];
                    current++;
                }
                
                // Kontrola, zda je to klíčové slovo
                if (this.keywords[value] !== undefined) {
                    this.tokens.push({ type: 'keyword', value, jsValue: this.keywords[value] });
                } else if (this.operators[value] !== undefined) {
                    this.tokens.push({ type: 'operator', value, jsValue: this.operators[value] });
                } else if (this.webAPI[value] !== undefined) {
                    this.tokens.push({ type: 'webapi', value, jsValue: this.webAPI[value] });
                } else {
                    this.tokens.push({ type: 'identifier', value });
                }
                continue;
            }
            
            // Speciální znaky
            const specialChars = '(){}[];,.:=+-*/<>!&|';
            if (specialChars.includes(char)) {
                this.tokens.push({ type: 'symbol', value: char });
                current++;
                continue;
            }
            
            current++;
        }
        
        return this.tokens;
    }
    
    /**
     * Transpilace českého kódu do JavaScriptu
     */
    transpile(code) {
        const tokens = this.tokenize(code);
        let jsCode = '';
        let i = 0;
        
        while (i < tokens.length) {
            const token = tokens[i];
            
            if (token.type === 'keyword') {
                // Speciální zpracování pro některá klíčová slova
                if (token.value === 'pak') {
                    // "pak" obvykle následuje po "když", takže ho přeskočíme
                    i++;
                    continue;
                } else if (token.value === 'pro_každý') {
                    jsCode += 'for (';
                    i++;
                    // Následuje proměnná
                    if (tokens[i] && tokens[i].type === 'symbol' && tokens[i].value === '(') {
                        jsCode += tokens[i].value;
                        i++;
                    }
                    if (tokens[i]) {
                        jsCode += 'const ' + tokens[i].value + ' ';
                        i++;
                    }
                    // "v" nebo "z"
                    if (tokens[i] && (tokens[i].value === 'v' || tokens[i].value === 'z')) {
                        jsCode += 'of ';
                        i++;
                    }
                    continue;
                } else {
                    jsCode += token.jsValue + ' ';
                }
            } else if (token.type === 'operator') {
                jsCode += ' ' + token.jsValue + ' ';
            } else if (token.type === 'webapi') {
                jsCode += token.jsValue;
            } else if (token.type === 'string') {
                jsCode += `"${token.value}"`;
            } else if (token.type === 'number') {
                jsCode += token.value;
            } else if (token.type === 'identifier') {
                jsCode += token.value;
            } else if (token.type === 'symbol') {
                jsCode += token.value;
            }
            
            i++;
        }
        
        return jsCode;
    }
    
    /**
     * Spuštění českého kódu
     */
    run(code) {
        try {
            const jsCode = this.transpile(code);
            console.log('Transpilovaný kód:', jsCode);
            
            // Vytvoříme funkci a spustíme ji
            const fn = new Function(jsCode);
            return fn();
        } catch (error) {
            console.error('Chyba při spouštění CzechScript:', error);
            throw error;
        }
    }
    
    /**
     * Načtení a spuštění souboru
     */
    async runFile(filepath) {
        try {
            const response = await fetch(filepath);
            const code = await response.text();
            return this.run(code);
        } catch (error) {
            console.error('Chyba při načítání souboru:', error);
            throw error;
        }
    }
    
    /**
     * Inicializace pro prohlížeč
     */
    static initBrowser() {
        document.addEventListener('DOMContentLoaded', () => {
            const scripts = document.querySelectorAll('script[typ="czechscript"]');
            const engine = new CzechScript();
            
            scripts.forEach(script => {
                if (script.src) {
                    engine.runFile(script.src);
                } else {
                    engine.run(script.textContent);
                }
            });
            
            // Zpracování inline eventů
            document.querySelectorAll('[když]').forEach(element => {
                const eventAttr = element.getAttribute('když');
                const actionAttr = element.getAttribute('pak');
                
                // Parsování eventu
                const eventMap = {
                    'klik': 'click',
                    'klik_L_myš': 'click',
                    'klik_P_myš': 'contextmenu',
                    'dvojklik': 'dblclick',
                    'najetí_myší': 'mouseenter',
                    'opuštění_myší': 'mouseleave',
                    'stisk_klávesy': 'keydown',
                    'puštění_klávesy': 'keyup',
                    'změna': 'change',
                    'odeslání': 'submit',
                    'načtení': 'load'
                };
                
                const jsEvent = eventMap[eventAttr] || eventAttr;
                
                element.addEventListener(jsEvent, function(e) {
                    if (actionAttr) {
                        // Pokus se spustit jako funkci
                        if (window[actionAttr] && typeof window[actionAttr] === 'function') {
                            window[actionAttr](e);
                        } else {
                            // Nebo jako CzechScript kód
                            engine.run(actionAttr);
                        }
                    }
                });
            });
        });
    }
}

// Export pro Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CzechScript;
}

// Auto-inicializace v prohlížeči
if (typeof window !== 'undefined') {
    window.CzechScript = CzechScript;
    CzechScript.initBrowser();
}
