/**
 * CzechScript - Pokročilé příklady
 * 
 * Tento soubor obsahuje pokročilé příklady použití CzechScript
 */

// ===================================================
// 1. ASYNCHRONNÍ PROGRAMOVÁNÍ
// ===================================================

async funkce stáhniAZpracuj(url) {
    zkus {
        vypiš("📥 Stahuji data z:", url);
        
        proměnná odpověď = čekej načti(url);
        
        když (!odpověď.ok) {
            hoď nový Error("HTTP chyba: " + odpověď.status);
        }
        
        proměnná data = čekej odpověď.json();
        vypiš("✅ Data stažena:", data.délka, "položek");
        
        // Zpracování dat
        proměnná zpracovaná = data.mapuj(položka => ({
            id: položka.id,
            název: položka.název.naVelká(),
            aktivní: pravda
        }));
        
        vrať zpracovaná;
        
    } chyť (chyba) {
        vypiš("❌ Chyba při stahování:", chyba.zpráva);
        vrať [];
    }
}

// Paralelní zpracování
async funkce zpracujVíceURL(urls) {
    vypiš("🚀 Spouštím paralelní stahování...");
    
    proměnná sliby = urls.mapuj(url => stáhniAZpracuj(url));
    proměnná výsledky = čekej Promise.všechny(sliby);
    
    proměnná celkem = výsledky.redukuj((součet, data) => součet + data.délka, 0);
    vypiš("📊 Celkem zpracováno:", celkem, "položek");
    
    vrať výsledky;
}

// ===================================================
// 2. OBJEKTOVĚ ORIENTOVANÉ PROGRAMOVÁNÍ
// ===================================================

třída Databáze {
    konstruktor(název) {
        toto.název = název;
        toto.data = nový Map();
        toto.indexy = nový Map();
        vypiš("💾 Databáze", název, "inicializována");
    }
    
    přidej(klíč, hodnota) {
        když (toto.data.has(klíč)) {
            hoď nový Error("Klíč '" + klíč + "' už existuje");
        }
        
        toto.data.set(klíč, hodnota);
        toto.aktualizujIndexy(klíč, hodnota);
        vypiš("✅ Přidáno:", klíč);
    }
    
    získej(klíč) {
        když (!toto.data.has(klíč)) {
            vrať null;
        }
        vrať toto.data.get(klíč);
    }
    
    aktualizuj(klíč, hodnota) {
        když (!toto.data.has(klíč)) {
            hoď nový Error("Klíč '" + klíč + "' neexistuje");
        }
        
        toto.data.set(klíč, hodnota);
        toto.aktualizujIndexy(klíč, hodnota);
        vypiš("🔄 Aktualizováno:", klíč);
    }
    
    smaž(klíč) {
        proměnná výsledek = toto.data.delete(klíč);
        když (výsledek) {
            vypiš("🗑️  Smazáno:", klíč);
        }
        vrať výsledek;
    }
    
    hledej(pole, hodnota) {
        proměnná výsledky = [];
        
        pro (proměnná [klíč, data] z toto.data) {
            když (data[pole] === hodnota) {
                výsledky.přidej({ klíč, data });
            }
        }
        
        vrať výsledky;
    }
    
    aktualizujIndexy(klíč, hodnota) {
        // Vytvoř indexy pro rychlejší vyhledávání
        pro (proměnná pole v hodnota) {
            když (!toto.indexy.has(pole)) {
                toto.indexy.set(pole, nový Map());
            }
            
            proměnná index = toto.indexy.get(pole);
            
            když (!index.has(hodnota[pole])) {
                index.set(hodnota[pole], []);
            }
            
            index.get(hodnota[pole]).přidej(klíč);
        }
    }
    
    statistiky() {
        vrať {
            celkemZáznamů: toto.data.size,
            celkemIndexů: toto.indexy.size,
            použitáPaměť: JSON.stringify(Array.from(toto.data)).délka
        };
    }
}

// Použití
proměnná db = nový Databáze("Uživatelé");

db.přidej("user1", {
    jméno: "Jan Novák",
    věk: 30,
    email: "jan@example.com"
});

db.přidej("user2", {
    jméno: "Marie Svobodová",
    věk: 25,
    email: "marie@example.com"
});

proměnná user = db.získej("user1");
vypiš("👤 Uživatel:", user);

proměnná výsledky = db.hledej("věk", 30);
vypiš("🔍 Nalezeno:", výsledky);

vypiš("📊 Statistiky:", db.statistiky());

// ===================================================
// 3. FUNKCIONÁLNÍ PROGRAMOVÁNÍ
// ===================================================

// Higher-order functions
funkce komponuj(...funkce) {
    vrať (x) => funkce.reduceRight((v, f) => f(v), x);
}

funkce curry(fn) {
    vrať funkce curried(...args) {
        když (args.délka >= fn.délka) {
            vrať fn.apply(toto, args);
        } jinak {
            vrať funkce(...args2) {
                vrať curried.apply(toto, args.concat(args2));
            };
        }
    };
}

// Příklady
proměnná přidej = curry((a, b) => a + b);
proměnná přidej5 = přidej(5);
vypiš("Přidej 5 k 10:", přidej5(10)); // 15

proměnná dvojnásob = x => x * 2;
proměnná přidej10 = x => x + 10;
proměnná transformuj = komponuj(dvojnásob, přidej10);

vypiš("Transformace 5:", transformuj(5)); // (5 + 10) * 2 = 30

// Pipeline pattern
funkce pipeline(vstup, ...funkce) {
    vrať funkce.redukuj((v, f) => f(v), vstup);
}

proměnná data = [1, 2, 3, 4, 5];

proměnná výsledek = pipeline(
    data,
    arr => arr.filtruj(x => x % 2 === 0),
    arr => arr.mapuj(x => x * 2),
    arr => arr.redukuj((a, b) => a + b, 0)
);

vypiš("Pipeline výsledek:", výsledek); // (2 + 4) * 2 = 12

// ===================================================
// 4. PATTERN MATCHING (simulace)
// ===================================================

funkce match(hodnota, vzory) {
    pro (proměnná [podmínka, handler] z vzory) {
        když (typeof podmínka === 'funkce') {
            když (podmínka(hodnota)) {
                vrať handler(hodnota);
            }
        } jinak když (podmínka === hodnota) {
            vrať handler(hodnota);
        }
    }
    
    // Default case
    proměnná defaultCase = vzory.najdi(([k]) => k === '_');
    když (defaultCase) {
        vrať defaultCase[1](hodnota);
    }
    
    hoď nový Error("Žádná shoda nalezena");
}

// Použití
funkce klasifikuj(číslo) {
    vrať match(pravda, [
        [číslo < 0, () => "záporné"],
        [číslo === 0, () => "nula"],
        [číslo > 0 && číslo < 10, () => "malé kladné"],
        [číslo >= 10, () => "velké kladné"],
        ['_', () => "neznámé"]
    ]);
}

vypiš("Klasifikace -5:", klasifikuj(-5));
vypiš("Klasifikace 0:", klasifikuj(0));
vypiš("Klasifikace 7:", klasifikuj(7));
vypiš("Klasifikace 15:", klasifikuj(15));

// ===================================================
// 5. EVENT SYSTEM
// ===================================================

třída EventEmitter {
    konstruktor() {
        toto.události = nový Map();
    }
    
    na(událost, handler) {
        když (!toto.události.has(událost)) {
            toto.události.set(událost, []);
        }
        toto.události.get(událost).přidej(handler);
    }
    
    jednou(událost, handler) {
        proměnná wrapper = (...args) => {
            handler(...args);
            toto.zruš(událost, wrapper);
        };
        toto.na(událost, wrapper);
    }
    
    vyvolej(událost, ...args) {
        když (!toto.události.has(událost)) vrať;
        
        proměnná handlery = toto.události.get(událost);
        handlery.forEach(handler => handler(...args));
    }
    
    zruš(událost, handler) {
        když (!toto.události.has(událost)) vrať;
        
        proměnná handlery = toto.události.get(událost);
        proměnná index = handlery.indexOf(handler);
        
        když (index > -1) {
            handlery.splice(index, 1);
        }
    }
}

// Použití
proměnná emitter = nový EventEmitter();

emitter.na("zpráva", (text) => {
    vypiš("📨 Přijata zpráva:", text);
});

emitter.jednou("připojeno", () => {
    vypiš("🔌 Připojeno k serveru");
});

emitter.vyvolej("zpráva", "Hello World!");
emitter.vyvolej("připojeno");
emitter.vyvolej("připojeno"); // Nevypíše nic (jednou)

// ===================================================
// 6. STATE MACHINE
// ===================================================

třída StateMachine {
    konstruktor(stavy, počátečníStav) {
        toto.stavy = stavy;
        toto.aktuálníStav = počátečníStav;
        vypiš("🎰 State machine inicializován. Stav:", počátečníStav);
    }
    
    přejdi(akce) {
        proměnná aktuálníStavObj = toto.stavy[toto.aktuálníStav];
        
        když (!aktuálníStavObj || !aktuálníStavObj.přechody[akce]) {
            vypiš("❌ Neplatný přechod:", toto.aktuálníStav, "->", akce);
            vrať nepravda;
        }
        
        proměnná nový Stav = aktuálníStavObj.přechody[akce];
        
        // Volitelný callback při opuštění stavu
        když (aktuálníStavObj.při Opuštění) {
            aktuálníStavObj.přiOpuštění();
        }
        
        vypiš("🔄 Přechod:", toto.aktuálníStav, "->", novýStav);
        toto.aktuálníStav = novýStav;
        
        // Volitelný callback při vstupu do stavu
        proměnná novýStavObj = toto.stavy[novýStav];
        když (novýStavObj.přiVstupu) {
            novýStavObj.přiVstupu();
        }
        
        vrať pravda;
    }
    
    získejStav() {
        vrať toto.aktuálníStav;
    }
}

// Příklad: Traffic light
proměnná semafor = nový StateMachine({
    červená: {
        přechody: {
            změň: "zelená"
        },
        přiVstupu() { vypiš("🔴 Červená - Stůj!"); }
    },
    zelená: {
        přechody: {
            změň: "žlutá"
        },
        přiVstupu() { vypiš("🟢 Zelená - Jeď!"); }
    },
    žlutá: {
        přechody: {
            změň: "červená"
        },
        přiVstupu() { vypiš("🟡 Žlutá - Pozor!"); }
    }
}, "červená");

semafor.přejdi("změň"); // zelená
semafor.přejdi("změň"); // žlutá
semafor.přejdi("změň"); // červená

// ===================================================
// 7. MEMOIZATION
// ===================================================

funkce memoizuj(fn) {
    proměnná cache = nový Map();
    
    vrať funkce(...args) {
        proměnná klíč = JSON.stringify(args);
        
        když (cache.has(klíč)) {
            vypiš("💾 Z cache:", klíč);
            vrať cache.get(klíč);
        }
        
        proměnná výsledek = fn.apply(toto, args);
        cache.set(klíč, výsledek);
        vypiš("🔄 Vypočteno:", klíč);
        
        vrať výsledek;
    };
}

// Fibonacci s memoizací
proměnná fib = memoizuj(funkce fibonacci(n) {
    když (n <= 1) vrať n;
    vrať fibonacci(n - 1) + fibonacci(n - 2);
});

vypiš("Fib(10):", fib(10));
vypiš("Fib(10) znovu:", fib(10)); // Z cache
vypiš("Fib(15):", fib(15));

// ===================================================
// 8. DECORATOR PATTERN
// ===================================================

funkce měřČas(fn) {
    vrať funkce(...args) {
        proměnná začátek = Date.now();
        proměnná výsledek = fn.apply(toto, args);
        proměnná konec = Date.now();
        
        vypiš("⏱  Funkce", fn.name, "trvala:", konec - začátek, "ms");
        vrať výsledek;
    };
}

funkce loguj(fn) {
    vrať funkce(...args) {
        vypiš("📝 Volání funkce", fn.name, "s argumenty:", args);
        proměnná výsledek = fn.apply(toto, args);
        vypiš("📝 Návrat:", výsledek);
        vrať výsledek;
    };
}

// Aplikace decoratorů
proměnná pomalá = měřČas(loguj(funkce složitýVýpočet(n) {
    proměnná součet = 0;
    pro (proměnná i = 0; i < n * 1000000; i++) {
        součet += i;
    }
    vrať součet;
}));

pomalá(10);

vypiš("\n🎉 Všechny příklady dokončeny!");
