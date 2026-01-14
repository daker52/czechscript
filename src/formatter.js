/**
 * CzechScript Formatter
 * Automatické formátování kódu
 */

class CzechScriptFormatter {
    constructor(možnosti = {}) {
        this.možnosti = {
            odsazení: 4,
            použítMezery: true,
            maxDélkaŘádku: 100,
            středníky: true,
            jednoduchéUvozovky: false,
            mezeraKolemOperátorů: true,
            mezeraPoČárce: true,
            mezeraPoDoublejtečce: true,
            mezeraKolemZávorek: false,
            novýŘádekNaKonci: true,
            ...možnosti
        };
    }
    
    formátuj(ast, zdrojovýKód) {
        this.aktuálníOdsazení = 0;
        this.výsledek = [];
        
        this.navštiv(ast);
        
        let kód = this.výsledek.join('');
        
        if (this.možnosti.novýŘádekNaKonci && !kód.endsWith('\n')) {
            kód += '\n';
        }
        
        return kód;
    }
    
    navštiv(uzel) {
        if (!uzel || !uzel.type) return;
        
        switch (uzel.type) {
            case 'Program':
                this.formátujProgram(uzel);
                break;
            case 'FunctionDeclaration':
                this.formátujFunkci(uzel);
                break;
            case 'VariableDeclaration':
                this.formátujProměnnou(uzel);
                break;
            case 'ClassDeclaration':
                this.formátujTřídu(uzel);
                break;
            case 'IfStatement':
                this.formátujIf(uzel);
                break;
            case 'ForStatement':
                this.formátujFor(uzel);
                break;
            case 'WhileStatement':
                this.formátujWhile(uzel);
                break;
            case 'ReturnStatement':
                this.formátujReturn(uzel);
                break;
            case 'ExpressionStatement':
                this.formátujExpression(uzel);
                break;
            case 'BlockStatement':
                this.formátujBlock(uzel);
                break;
            // ... další případy
            default:
                this.výsledek.push('/* neimplementovaný formátovací uzel: ' + uzel.type + ' */');
        }
    }
    
    formátujProgram(uzel) {
        uzel.body.forEach((příkaz, index) => {
            this.navštiv(příkaz);
            if (index < uzel.body.length - 1) {
                this.výsledek.push('\n');
            }
        });
    }
    
    formátujFunkci(uzel) {
        this.přidejOdsazení();
        
        if (uzel.async) {
            this.výsledek.push('async ');
        }
        
        this.výsledek.push('funkce ');
        
        if (uzel.id) {
            this.výsledek.push(uzel.id.name);
        }
        
        this.výsledek.push('(');
        
        if (uzel.params) {
            uzel.params.forEach((param, index) => {
                this.výsledek.push(param.name);
                
                if (param.typeAnnotation) {
                    this.výsledek.push(': ');
                    this.výsledek.push(param.typeAnnotation);
                }
                
                if (index < uzel.params.length - 1) {
                    this.výsledek.push(',');
                    if (this.možnosti.mezeraPoČárce) {
                        this.výsledek.push(' ');
                    }
                }
            });
        }
        
        this.výsledek.push(')');
        
        if (uzel.returnType) {
            this.výsledek.push(': ');
            this.výsledek.push(uzel.returnType);
        }
        
        this.výsledek.push(' ');
        this.navštiv(uzel.body);
        this.výsledek.push('\n');
    }
    
    formátujProměnnou(uzel) {
        this.přidejOdsazení();
        
        this.výsledek.push(uzel.kind);
        this.výsledek.push(' ');
        
        uzel.declarations.forEach((deklarace, index) => {
            this.výsledek.push(deklarace.id.name);
            
            if (deklarace.typeAnnotation) {
                this.výsledek.push(': ');
                this.výsledek.push(deklarace.typeAnnotation);
            }
            
            if (deklarace.init) {
                this.výsledek.push(' = ');
                this.formátujHodnotu(deklarace.init);
            }
            
            if (index < uzel.declarations.length - 1) {
                this.výsledek.push(',');
                if (this.možnosti.mezeraPoČárce) {
                    this.výsledek.push(' ');
                }
            }
        });
        
        if (this.možnosti.středníky) {
            this.výsledek.push(';');
        }
        this.výsledek.push('\n');
    }
    
    formátujTřídu(uzel) {
        this.přidejOdsazení();
        
        this.výsledek.push('třída ');
        this.výsledek.push(uzel.id.name);
        
        if (uzel.superClass) {
            this.výsledek.push(' rozšiřuje ');
            this.výsledek.push(uzel.superClass.name);
        }
        
        this.výsledek.push(' {\n');
        this.aktuálníOdsazení++;
        
        uzel.body.body.forEach(člen => {
            this.navštiv(člen);
        });
        
        this.aktuálníOdsazení--;
        this.přidejOdsazení();
        this.výsledek.push('}\n');
    }
    
    formátujIf(uzel) {
        this.přidejOdsazení();
        
        this.výsledek.push('když (');
        this.formátujHodnotu(uzel.test);
        this.výsledek.push(') ');
        
        this.navštiv(uzel.consequent);
        
        if (uzel.alternate) {
            this.přidejOdsazení();
            this.výsledek.push('jinak ');
            this.navštiv(uzel.alternate);
        }
    }
    
    formátujFor(uzel) {
        this.přidejOdsazení();
        
        this.výsledek.push('pro (');
        
        if (uzel.init) {
            this.formátujHodnotu(uzel.init);
        }
        this.výsledek.push('; ');
        
        if (uzel.test) {
            this.formátujHodnotu(uzel.test);
        }
        this.výsledek.push('; ');
        
        if (uzel.update) {
            this.formátujHodnotu(uzel.update);
        }
        
        this.výsledek.push(') ');
        this.navštiv(uzel.body);
    }
    
    formátujWhile(uzel) {
        this.přidejOdsazení();
        
        this.výsledek.push('dokud (');
        this.formátujHodnotu(uzel.test);
        this.výsledek.push(') ');
        
        this.navštiv(uzel.body);
    }
    
    formátujReturn(uzel) {
        this.přidejOdsazení();
        
        this.výsledek.push('vrať');
        
        if (uzel.argument) {
            this.výsledek.push(' ');
            this.formátujHodnotu(uzel.argument);
        }
        
        if (this.možnosti.středníky) {
            this.výsledek.push(';');
        }
        this.výsledek.push('\n');
    }
    
    formátujExpression(uzel) {
        this.přidejOdsazení();
        this.formátujHodnotu(uzel.expression);
        
        if (this.možnosti.středníky) {
            this.výsledek.push(';');
        }
        this.výsledek.push('\n');
    }
    
    formátujBlock(uzel) {
        this.výsledek.push('{\n');
        this.aktuálníOdsazení++;
        
        uzel.body.forEach(příkaz => {
            this.navštiv(příkaz);
        });
        
        this.aktuálníOdsazení--;
        this.přidejOdsazení();
        this.výsledek.push('}\n');
    }
    
    formátujHodnotu(uzel) {
        if (!uzel) return;
        
        switch (uzel.type) {
            case 'Literal':
                if (typeof uzel.value === 'string') {
                    const uvozovka = this.možnosti.jednoduchéUvozovky ? "'" : '"';
                    this.výsledek.push(uvozovka + uzel.value + uvozovka);
                } else {
                    this.výsledek.push(String(uzel.value));
                }
                break;
                
            case 'Identifier':
                this.výsledek.push(uzel.name);
                break;
                
            case 'BinaryExpression':
                this.formátujHodnotu(uzel.left);
                if (this.možnosti.mezeraKolemOperátorů) {
                    this.výsledek.push(' ');
                }
                this.výsledek.push(uzel.operator);
                if (this.možnosti.mezeraKolemOperátorů) {
                    this.výsledek.push(' ');
                }
                this.formátujHodnotu(uzel.right);
                break;
                
            case 'CallExpression':
                this.formátujHodnotu(uzel.callee);
                this.výsledek.push('(');
                uzel.arguments.forEach((arg, index) => {
                    this.formátujHodnotu(arg);
                    if (index < uzel.arguments.length - 1) {
                        this.výsledek.push(',');
                        if (this.možnosti.mezeraPoČárce) {
                            this.výsledek.push(' ');
                        }
                    }
                });
                this.výsledek.push(')');
                break;
                
            case 'ArrayExpression':
                this.výsledek.push('[');
                uzel.elements.forEach((elem, index) => {
                    this.formátujHodnotu(elem);
                    if (index < uzel.elements.length - 1) {
                        this.výsledek.push(',');
                        if (this.možnosti.mezeraPoČárce) {
                            this.výsledek.push(' ');
                        }
                    }
                });
                this.výsledek.push(']');
                break;
                
            case 'ObjectExpression':
                this.výsledek.push('{ ');
                uzel.properties.forEach((prop, index) => {
                    this.výsledek.push(prop.key.name || prop.key.value);
                    this.výsledek.push(':');
                    if (this.možnosti.mezeraPoDoublejtečce) {
                        this.výsledek.push(' ');
                    }
                    this.formátujHodnotu(prop.value);
                    if (index < uzel.properties.length - 1) {
                        this.výsledek.push(',');
                        if (this.možnosti.mezeraPoČárce) {
                            this.výsledek.push(' ');
                        }
                    }
                });
                this.výsledek.push(' }');
                break;
                
            default:
                this.výsledek.push('/* neimplementovaný formátovací výraz: ' + uzel.type + ' */');
        }
    }
    
    přidejOdsazení() {
        const odsazení = this.možnosti.použítMezery 
            ? ' '.repeat(this.aktuálníOdsazení * this.možnosti.odsazení)
            : '\t'.repeat(this.aktuálníOdsazení);
        
        this.výsledek.push(odsazení);
    }
}

module.exports = { CzechScriptFormatter };
