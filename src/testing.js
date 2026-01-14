/**
 * CzechScript Testing Framework
 * Framework pro psaní a spouštění testů v češtině
 */

class TestováníFramework {
    constructor() {
        this.testy = [];
        this.výsledky = [];
        this.aktuálníSkupina = null;
        this.beforeEachCallbacks = [];
        this.afterEachCallbacks = [];
        this.beforeAllCallbacks = [];
        this.afterAllCallbacks = [];
    }
    
    // Definice testu
    testuj(název, callback) {
        this.testy.push({
            název,
            callback,
            skupina: this.aktuálníSkupina,
            typ: 'test'
        });
    }
    
    // Skupina testů
    skupina(název, callback) {
        const předchozíSkupina = this.aktuálníSkupina;
        this.aktuálníSkupina = název;
        callback();
        this.aktuálníSkupina = předchozíSkupina;
    }
    
    // Lifecycle hooks
    předKaždým(callback) {
        this.beforeEachCallbacks.push(callback);
    }
    
    poKaždém(callback) {
        this.afterEachCallbacks.push(callback);
    }
    
    předVšemi(callback) {
        this.beforeAllCallbacks.push(callback);
    }
    
    poVšech(callback) {
        this.afterAllCallbacks.push(callback);
    }
    
    // Spuštění testů
    async spusť(možnosti = {}) {
        const { verbose = true, bail = false } = možnosti;
        
        this.výsledky = [];
        let úspěšné = 0;
        let neúspěšné = 0;
        let přeskočené = 0;
        
        const začátek = Date.now();
        
        if (verbose) {
            console.log('\n🧪 Spouštím testy CzechScript...\n');
        }
        
        // Before all
        for (const callback of this.beforeAllCallbacks) {
            await callback();
        }
        
        // Spusť testy
        for (const test of this.testy) {
            if (test.typ === 'skip') {
                přeskočené++;
                if (verbose) {
                    console.log(`  ⊝ ${test.skupina ? test.skupina + ' › ' : ''}${test.název} (přeskočeno)`);
                }
                continue;
            }
            
            try {
                // Before each
                for (const callback of this.beforeEachCallbacks) {
                    await callback();
                }
                
                // Spusť test
                await test.callback(new Assertions());
                
                // After each
                for (const callback of this.afterEachCallbacks) {
                    await callback();
                }
                
                úspěšné++;
                this.výsledky.push({ test, úspěch: true });
                
                if (verbose) {
                    console.log(`  ✓ ${test.skupina ? test.skupina + ' › ' : ''}${test.název}`);
                }
                
            } catch (chyba) {
                neúspěšné++;
                this.výsledky.push({ test, úspěch: false, chyba });
                
                if (verbose) {
                    console.log(`  ✗ ${test.skupina ? test.skupina + ' › ' : ''}${test.název}`);
                    console.log(`    ${chyba.message}`);
                }
                
                if (bail) {
                    break;
                }
            }
        }
        
        // After all
        for (const callback of this.afterAllCallbacks) {
            await callback();
        }
        
        const konec = Date.now();
        const trvání = konec - začátek;
        
        if (verbose) {
            console.log('\n' + '─'.repeat(50));
            console.log(`\n📊 Výsledky:`);
            console.log(`   Celkem:      ${this.testy.length}`);
            console.log(`   ✓ Úspěšné:   ${úspěšné}`);
            console.log(`   ✗ Neúspěšné: ${neúspěšné}`);
            console.log(`   ⊝ Přeskočené: ${přeskočené}`);
            console.log(`   ⏱ Čas:       ${trvání}ms`);
            console.log('');
        }
        
        return {
            celkem: this.testy.length,
            úspěšné,
            neúspěšné,
            přeskočené,
            trvání,
            úspěch: neúspěšné === 0
        };
    }
    
    // Pouze tento test
    pouze(název, callback) {
        this.testy = this.testy.filter(t => t.typ !== 'only');
        this.testy.push({
            název,
            callback,
            skupina: this.aktuálníSkupina,
            typ: 'only'
        });
    }
    
    // Přeskoč test
    přeskoč(název, callback) {
        this.testy.push({
            název,
            callback,
            skupina: this.aktuálníSkupina,
            typ: 'skip'
        });
    }
}

// Assertion knihovna
class Assertions {
    // Základní assertions
    očekávej(hodnota) {
        return {
            býtRovno(očekávaná) {
                if (hodnota !== očekávaná) {
                    throw new Error(`Očekávána hodnota ${očekávaná}, ale získána ${hodnota}`);
                }
            },
            
            býtHlubokořovno(očekávaná) {
                if (JSON.stringify(hodnota) !== JSON.stringify(očekávaná)) {
                    throw new Error(
                        `Očekáváno: ${JSON.stringify(očekávaná)}\n` +
                        `Získáno:   ${JSON.stringify(hodnota)}`
                    );
                }
            },
            
            nebýtRovno(neočekávaná) {
                if (hodnota === neočekávaná) {
                    throw new Error(`Hodnota by neměla být ${neočekávaná}`);
                }
            },
            
            býtPravda() {
                if (hodnota !== true) {
                    throw new Error(`Očekávána pravda, ale získána ${hodnota}`);
                }
            },
            
            býtLež() {
                if (hodnota !== false) {
                    throw new Error(`Očekávána lež, ale získána ${hodnota}`);
                }
            },
            
            býtNull() {
                if (hodnota !== null) {
                    throw new Error(`Očekáván null, ale získána ${hodnota}`);
                }
            },
            
            býtUndefined() {
                if (hodnota !== undefined) {
                    throw new Error(`Očekáván undefined, ale získána ${hodnota}`);
                }
            },
            
            býtDefinováno() {
                if (hodnota === undefined) {
                    throw new Error(`Hodnota by měla být definována`);
                }
            },
            
            býtTyp(typ) {
                if (typeof hodnota !== typ) {
                    throw new Error(`Očekáván typ ${typ}, ale získán ${typeof hodnota}`);
                }
            },
            
            obsahovat(položka) {
                if (Array.isArray(hodnota)) {
                    if (!hodnota.includes(položka)) {
                        throw new Error(`Pole neobsahuje ${položka}`);
                    }
                } else if (typeof hodnota === 'string') {
                    if (!hodnota.includes(položka)) {
                        throw new Error(`Řetězec neobsahuje "${položka}"`);
                    }
                } else {
                    throw new Error(`Hodnota není pole ani řetězec`);
                }
            },
            
            býtVětšíNež(než) {
                if (hodnota <= než) {
                    throw new Error(`Očekáváno ${hodnota} > ${než}`);
                }
            },
            
            býtMenšíNež(než) {
                if (hodnota >= než) {
                    throw new Error(`Očekáváno ${hodnota} < ${než}`);
                }
            },
            
            býtVětšíNeboRovno(než) {
                if (hodnota < než) {
                    throw new Error(`Očekáváno ${hodnota} >= ${než}`);
                }
            },
            
            býtMenšíNeboRovno(než) {
                if (hodnota > než) {
                    throw new Error(`Očekáváno ${hodnota} <= ${než}`);
                }
            },
            
            mítDélku(délka) {
                if (hodnota.length !== délka) {
                    throw new Error(`Očekávána délka ${délka}, ale získána ${hodnota.length}`);
                }
            },
            
            odpovídatRegexu(regex) {
                if (!regex.test(hodnota)) {
                    throw new Error(`Hodnota neodpovídá regulárnímu výrazu ${regex}`);
                }
            },
            
            býtInstance(třída) {
                if (!(hodnota instanceof třída)) {
                    throw new Error(`Hodnota není instance ${třída.name}`);
                }
            },
            
            mítVlastnost(vlastnost) {
                if (!hodnota.hasOwnProperty(vlastnost)) {
                    throw new Error(`Objekt nemá vlastnost "${vlastnost}"`);
                }
            }
        };
    }
    
    // Asynchronní assertions
    async očekávejAsync(promise) {
        try {
            const hodnota = await promise;
            return this.očekávej(hodnota);
        } catch (chyba) {
            throw chyba;
        }
    }
    
    // Očekávej chybu
    async očekávejChybu(callback, očekávanáZpráva = null) {
        try {
            await callback();
            throw new Error('Očekávána chyba, ale žádná nebyla vyhozena');
        } catch (chyba) {
            if (očekávanáZpráva && !chyba.message.includes(očekávanáZpráva)) {
                throw new Error(
                    `Očekávána chyba s "${očekávanáZpráva}", ` +
                    `ale získána "${chyba.message}"`
                );
            }
        }
    }
}

// Mock helpers
class MockHelper {
    vytvořMock() {
        const volání = [];
        
        const mock = function(...args) {
            volání.push(args);
            return mock.návratováHodnota;
        };
        
        mock.volání = volání;
        mock.návratováHodnota = undefined;
        mock.vrať = function(hodnota) {
            this.návratováHodnota = hodnota;
            return this;
        };
        mock.bylZavolán = function() {
            return volání.length > 0;
        };
        mock.bylZavolánKrát = function(n) {
            return volání.length === n;
        };
        mock.bylZavolánS = function(...očekávanéArgs) {
            return volání.some(args => 
                JSON.stringify(args) === JSON.stringify(očekávanéArgs)
            );
        };
        
        return mock;
    }
    
    vytvořSpy(objekt, metoda) {
        const původní = objekt[metoda];
        const volání = [];
        
        objekt[metoda] = function(...args) {
            volání.push(args);
            return původní.apply(this, args);
        };
        
        objekt[metoda].volání = volání;
        objekt[metoda].obnov = function() {
            objekt[metoda] = původní;
        };
        
        return objekt[metoda];
    }
}

// Globální instance
const testováníFramework = new TestováníFramework();
const mockHelper = new MockHelper();

// Globální funkce
function testuj(název, callback) {
    testováníFramework.testuj(název, callback);
}

function skupina(název, callback) {
    testováníFramework.skupina(název, callback);
}

function předKaždým(callback) {
    testováníFramework.předKaždým(callback);
}

function poKaždém(callback) {
    testováníFramework.poKaždém(callback);
}

function předVšemi(callback) {
    testováníFramework.předVšemi(callback);
}

function poVšech(callback) {
    testováníFramework.poVšech(callback);
}

function pouze(název, callback) {
    testováníFramework.pouze(název, callback);
}

function přeskoč(název, callback) {
    testováníFramework.přeskoč(název, callback);
}

async function spuťTesty(možnosti) {
    return await testováníFramework.spusť(možnosti);
}

// Export
module.exports = {
    TestováníFramework,
    Assertions,
    MockHelper,
    testuj,
    skupina,
    předKaždým,
    poKaždém,
    předVšemi,
    poVšech,
    pouze,
    přeskoč,
    spuťTesty,
    mockHelper
};
