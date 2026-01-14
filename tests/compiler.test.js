// Test suite pro CzechScript Compiler

const { CzechScriptCompiler } = require('../src/compiler');
const assert = require('assert');

function test(název, fn) {
    try {
        fn();
        console.log(`✅ ${název}`);
    } catch (error) {
        console.error(`❌ ${název}`);
        console.error(`   ${error.message}`);
    }
}

function assertEqual(actual, expected, message = '') {
    if (actual !== expected) {
        throw new Error(`${message}\n  Očekáváno: ${expected}\n  Získáno: ${actual}`);
    }
}

function assertContains(text, substring, message = '') {
    if (!text.includes(substring)) {
        throw new Error(`${message}\n  Text neobsahuje: ${substring}`);
    }
}

console.log('\n🧪 CzechScript Compiler Tests\n');

const compiler = new CzechScriptCompiler();

// ===== Proměnné =====

test('Kompilace proměnné', () => {
    const result = compiler.compile('proměnná x = 5;');
    assertEqual(result.success, true);
    assertContains(result.code, 'let x = 5');
});

test('Kompilace konstanty', () => {
    const result = compiler.compile('konstanta PI = 3.14;');
    assertEqual(result.success, true);
    assertContains(result.code, 'const PI = 3.14');
});

test('Více proměnných', () => {
    const result = compiler.compile('proměnná a = 1, b = 2, c = 3;');
    assertEqual(result.success, true);
    assertContains(result.code, 'let a = 1, b = 2, c = 3');
});

// ===== Funkce =====

test('Kompilace funkce', () => {
    const code = `
        funkce sečti(a, b) {
            vrať a + b;
        }
    `;
    const result = compiler.compile(code);
    assertEqual(result.success, true);
    assertContains(result.code, 'function sečti(a, b)');
    assertContains(result.code, 'return a + b');
});

test('Funkce s výchozím parametrem', () => {
    const code = `
        funkce pozdrav(jméno = "světe") {
            vrať "Ahoj " + jméno;
        }
    `;
    const result = compiler.compile(code);
    assertEqual(result.success, true);
    assertContains(result.code, 'jméno = "světe"');
});

// ===== Podmínky =====

test('If-else', () => {
    const code = `
        když (x větší 10) {
            vypis("velké");
        } jinak {
            vypis("malé");
        }
    `;
    const result = compiler.compile(code);
    assertEqual(result.success, true);
    assertContains(result.code, 'if (x > 10)');
    assertContains(result.code, 'else');
});

test('Logické operátory', () => {
    const code = 'proměnná výsledek = pravda a nepravda nebo pravda;';
    const result = compiler.compile(code);
    assertEqual(result.success, true);
    assertContains(result.code, '&&');
    assertContains(result.code, '||');
});

// ===== Cykly =====

test('While cyklus', () => {
    const code = `
        dokud (i menší 10) {
            i++;
        }
    `;
    const result = compiler.compile(code);
    assertEqual(result.success, true);
    assertContains(result.code, 'while (i < 10)');
});

test('For-each cyklus', () => {
    const code = `
        pro_každý (položka v pole) {
            vypis(položka);
        }
    `;
    const result = compiler.compile(code);
    assertEqual(result.success, true);
    assertContains(result.code, 'for (const položka of pole)');
});

test('Opakuj cyklus', () => {
    const code = `
        opakuj (5) {
            vypis("Ahoj");
        }
    `;
    const result = compiler.compile(code);
    assertEqual(result.success, true);
    assertContains(result.code, 'for (let __i = 0; __i < 5; __i++)');
});

// ===== Třídy =====

test('Třída', () => {
    const code = `
        třída Osoba {
            konstruktor(jméno) {
                tento.jméno = jméno;
            }
            
            pozdrav() {
                vrať "Ahoj";
            }
        }
    `;
    const result = compiler.compile(code);
    assertEqual(result.success, true);
    assertContains(result.code, 'class Osoba');
    assertContains(result.code, 'constructor(jméno)');
    assertContains(result.code, 'this.jméno = jméno');
});

test('Třída s dědičností', () => {
    const code = `
        třída Student rozšiřuje Osoba {
            konstruktor(jméno, škola) {
                super(jméno);
                tento.škola = škola;
            }
        }
    `;
    const result = compiler.compile(code);
    assertEqual(result.success, true);
    assertContains(result.code, 'extends Osoba');
});

// ===== Zpracování chyb =====

test('Try-catch', () => {
    const code = `
        zkus {
            něco();
        } chyť (e) {
            vypis(e);
        }
    `;
    const result = compiler.compile(code);
    assertEqual(result.success, true);
    assertContains(result.code, 'try');
    assertContains(result.code, 'catch (e)');
});

test('Throw', () => {
    const code = 'hoď nový Error("Chyba");';
    const result = compiler.compile(code);
    assertEqual(result.success, true);
    assertContains(result.code, 'throw new Error');
});

// ===== Pole a objekty =====

test('Pole', () => {
    const code = 'proměnná pole = [1, 2, 3, 4, 5];';
    const result = compiler.compile(code);
    assertEqual(result.success, true);
    assertContains(result.code, '[1, 2, 3, 4, 5]');
});

test('Objekt', () => {
    const code = `
        proměnná osoba = {
            jméno: "Jan",
            věk: 25
        };
    `;
    const result = compiler.compile(code);
    assertEqual(result.success, true);
    assertContains(result.code, 'jméno: "Jan"');
    assertContains(result.code, 'věk: 25');
});

// ===== Operátory =====

test('Porovnávací operátory', () => {
    const code = `
        proměnná a = x rovno y;
        proměnná b = x nerovno y;
        proměnná c = x větší y;
        proměnná d = x menší y;
        proměnná e = x větší_rovno y;
        proměnná f = x menší_rovno y;
    `;
    const result = compiler.compile(code);
    assertEqual(result.success, true);
    assertContains(result.code, 'x === y');
    assertContains(result.code, 'x !== y');
    assertContains(result.code, 'x > y');
    assertContains(result.code, 'x < y');
    assertContains(result.code, 'x >= y');
    assertContains(result.code, 'x <= y');
});

test('Aritmetické operátory', () => {
    const code = 'proměnná výsledek = (a + b) * c / d - e % f;';
    const result = compiler.compile(code);
    assertEqual(result.success, true);
    assertContains(result.code, '(a + b) * c / d - e % f');
});

// ===== Optimalizace =====

test('Constant folding - sčítání', () => {
    const compiler2 = new CzechScriptCompiler({ optimize: true });
    const code = 'proměnná x = 2 + 3;';
    const result = compiler2.compile(code);
    assertEqual(result.success, true);
    assertContains(result.code, 'let x = 5');
});

test('Constant folding - násobení', () => {
    const compiler2 = new CzechScriptCompiler({ optimize: true });
    const code = 'proměnná x = 10 * 5;';
    const result = compiler2.compile(code);
    assertEqual(result.success, true);
    assertContains(result.code, 'let x = 50');
});

// ===== Error handling =====

test('Chyba - neukončený řetězec', () => {
    const code = 'proměnná text = "ahoj';
    const result = compiler.compile(code);
    assertEqual(result.success, false);
    assertEqual(result.errors.length > 0, true);
});

test('Varování - nedefinovaná proměnná', () => {
    const compiler2 = new CzechScriptCompiler({ strict: true });
    const code = 'vypis(nedefinováno);';
    const result = compiler2.compile(code);
    assertEqual(result.success, true);
    assertEqual(result.warnings.length > 0, true);
});

// ===== Moduly =====

test('Import', () => {
    const code = 'importuj { funkce1, funkce2 } z "modul";';
    const result = compiler.compile(code);
    assertEqual(result.success, true);
    assertContains(result.code, 'import { funkce1, funkce2 } from "modul"');
});

test('Export', () => {
    const code = 'exportuj konstanta PI = 3.14;';
    const result = compiler.compile(code);
    assertEqual(result.success, true);
    assertContains(result.code, 'export const PI = 3.14');
});

// ===== Komplexní příklad =====

test('Komplexní program', () => {
    const code = `
        třída Počítadlo {
            konstruktor(start = 0) {
                tento.hodnota = start;
            }
            
            zvyš() {
                tento.hodnota++;
                vrať tento.hodnota;
            }
            
            sniž() {
                když (tento.hodnota větší 0) {
                    tento.hodnota--;
                }
                vrať tento.hodnota;
            }
        }
        
        proměnná počítadlo = nový Počítadlo(10);
        
        opakuj (5) {
            počítadlo.zvyš();
        }
        
        dokud (počítadlo.hodnota větší 0) {
            počítadlo.sniž();
        }
    `;
    
    const result = compiler.compile(code);
    assertEqual(result.success, true);
    assertContains(result.code, 'class Počítadlo');
    assertContains(result.code, 'new Počítadlo(10)');
    assertContains(result.code, 'for (let __i = 0; __i < 5; __i++)');
    assertContains(result.code, 'while (počítadlo.hodnota > 0)');
});

console.log('\n✨ Všechny testy dokončeny!\n');
