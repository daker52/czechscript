// ===== UKÁZKY SYNTAXE CZECHSCRIPT =====

// ----- Proměnné a konstanty -----

proměnná jméno = "Jan";
konstanta věk = 25;
proměnná aktivní = pravda;

proměnná čísla: pole = [1, 2, 3, 4, 5];
proměnná osoba: objekt = {
    jméno: "Anna",
    příjmení: "Nováková",
    věk: 30
};


// ----- Funkce -----

funkce pozdrav(jméno: řetězec): řetězec {
    vrať "Ahoj, " + jméno + "!";
}

funkce sečti(a: číslo, b: číslo): číslo {
    vrať a + b;
}

funkce jePololetní(věk: číslo): boolean {
    když (věk >= 18) pak {
        vrať pravda;
    } jinak {
        vrať nepravda;
    }
}


// ----- Podmínky -----

proměnná věk = 20;

když (věk >= 18) pak {
    vypis("Jsi dospělý");
} jinak když (věk >= 13) pak {
    vypis("Jsi teenager");
} jinak {
    vypis("Jsi dítě");
}

// Krátká forma
když (věk větší_rovno 18) vypis("Můžeš volit");


// ----- Cykly -----

// For - opakuj X-krát
opakuj (5) {
    vypis("Ahoj!");
}

// While
proměnná počítadlo = 0;
dokud (počítadlo menší 10) {
    vypis(počítadlo);
    počítadlo++;
}

// For each
konstanta jména = ["Jan", "Eva", "Petr", "Anna"];

pro_každý (jméno v jména) {
    vypis("Ahoj, " + jméno);
}

// S indexem
pro_každý (číslo v [10, 20, 30, 40]) {
    vypis(číslo * 2);
}


// ----- Pole (Arrays) -----

proměnná ovoce = ["jablko", "hruška", "banán"];

přidej(ovoce, "pomeranč");  // Přidá položku
vypis(délka(ovoce));        // Délka pole

proměnná druhé = ovoce[1];  // Přístup k prvku

// Metody pole
proměnná čísla = [1, 2, 3, 4, 5];

proměnná dvojnásobky = mapuj(čísla, funkce(x) {
    vrať x * 2;
});

proměnná sudá = filtruj(čísla, funkce(x) {
    vrať x % 2 rovno 0;
});


// ----- Objekty -----

proměnná auto = {
    značka: "Škoda",
    model: "Octavia",
    rok: 2023,
    barva: "červená",
    
    info: funkce() {
        vrať tento.značka + " " + tento.model;
    }
};

vypis(auto.značka);         // Přístup k vlastnosti
vypis(auto["model"]);       // Alternativní syntaxe
vypis(auto.info());         // Volání metody


// ----- Třídy -----

třída Osoba {
    konstruktor(jméno, věk) {
        tento.jméno = jméno;
        tento.věk = věk;
    }
    
    představSe() {
        vypis("Ahoj, jmenuji se " + tento.jméno + " a je mi " + tento.věk + " let.");
    }
    
    oslavNarozeniny() {
        tento.věk++;
        vypis("Gratulujeme! Nyní je mi " + tento.věk + " let.");
    }
}

proměnná jan = nový Osoba("Jan", 25);
jan.představSe();
jan.oslavNarozeniny();


// Dědičnost
třída Student rozšiřuje Osoba {
    konstruktor(jméno, věk, škola) {
        super(jméno, věk);
        tento.škola = škola;
    }
    
    studuje() {
        vypis(tento.jméno + " studuje na " + tento.škola);
    }
}

proměnná eva = nový Student("Eva", 20, "ČVUT");
eva.představSe();
eva.studuje();


// ----- DOM Manipulace -----

// Výběr elementů
proměnná nadpis = prvek("#nadpis");
proměnná tlačítka = prvky(".tlačítko");

// Vytvoření elementu
proměnná div = vytvoř("div");
div.textContent = "Nový div";
nadpis.appendChild(div);

// Přidání třídy
přidejTřídu(nadpis, "velký");
odeberTřídu(nadpis, "malý");
přepniTřídu(nadpis, "aktivní");

// Nastavení stylu
nastavStyl(nadpis, "color", "modrá");
nastavStyl(nadpis, "fontSize", "24px");

// Atributy
nastavAtribut(nadpis, "data-id", "123");
proměnná id = získejAtribut(nadpis, "data-id");


// ----- Události -----

poKliknutí("#tlačítko", funkce() {
    vypis("Tlačítko bylo kliknuto!");
});

poNačtení(funkce() {
    vypis("Stránka je načtena!");
});


// ----- HTTP Requesty -----

async funkce získejUživatele() {
    zkus {
        proměnná data = await načtiData("https://api.example.com/users");
        vypis(data);
    } chyť (chyba) {
        vypisChybu("Chyba:", chyba);
    }
}

async funkce vytvoř Uživatele(uživatel) {
    zkus {
        proměnná odpověď = await odesliData("https://api.example.com/users", uživatel);
        vypis("Uživatel vytvořen:", odpověď);
    } chyť (chyba) {
        vypisChybu("Chyba:", chyba);
    }
}


// ----- LocalStorage -----

proměnná nastavení = {
    jazyk: "cs",
    téma: "tmavé",
    notifikace: pravda
};

// Uložení
ulož("nastavení", nastavení);

// Načtení
proměnná načtenéNastavení = načti("nastavení");
vypis(načtenéNastavení);

// Smazání
smaž("nastavení");


// ----- Práce s řetězci -----

proměnná text = "CzechScript je skvělý!";

vypis(délkaŘetězce(text));           // Délka
vypis(velkáPísmena(text));            // VELKÝMI
vypis(malápísmena(text));             // malými

proměnná slova = rozdělŘetězec(text, " ");  // Rozdělení
vypis(slova);

vypis(začínáNa(text, "Czech"));       // true
vypis(končíNa(text, "!"));            // true

proměnná novýText = nahraď(text, "skvělý", "úžasný");
vypis(novýText);


// ----- Matematika -----

proměnná x = náhodnéČíslo(0, 100);          // Náhodné číslo 0-100
proměnná y = náhodnéCeléČíslo(1, 10);       // Náhodné celé číslo 1-10

vypis(zaokrouhli(3.7));              // 4
vypis(zaokrouhliNahoru(3.1));        // 4
vypis(zaokrouhliDolů(3.9));          // 3

vypis(absolutníHodnota(-5));         // 5
vypis(mocnina(2, 3));                // 8
vypis(odmocnina(16));                // 4


// ----- Časovače -----

async funkce hlavní() {
    vypis("Start");
    
    await čekej(1000);  // Čekej 1 sekundu
    vypis("Po 1 sekundě");
    
    await čekej(2000);  // Čekej 2 sekundy
    vypis("Po dalších 2 sekundách");
}

// Časovač
nastavČasovač(funkce() {
    vypis("Po 3 sekundách");
}, 3000);

// Interval
proměnná intervalId = nastavInterval(funkce() {
    vypis("Každou sekundu");
}, 1000);

// Zrušení intervalu po 5 sekundách
nastavČasovač(funkce() {
    zrušInterval(intervalId);
}, 5000);


// ----- Zpracování chyb -----

zkus {
    proměnná výsledek = 10 / 0;
    když (ne isFinite(výsledek)) {
        hoď nový Error("Dělení nulou!");
    }
} chyť (chyba) {
    vypisChybu("Nastala chyba:", chyba.message);
} nakonec {
    vypis("Hotovo");
}


// ----- Moduly -----

// export.cs
exportuj funkce pozdrav(jméno) {
    vrať "Ahoj, " + jméno;
}

exportuj konstanta PI = 3.14159;

// main.cs
importuj { pozdrav, PI } z "./export.cs";

vypis(pozdrav("světe"));
vypis(PI);


// ----- Pokročilé funkce -----

// Arrow funkce
proměnná součet = (a, b) => a + b;
proměnná dvojnásobek = x => x * 2;

// Výchozí parametry
funkce pozdrav(jméno = "návštěvníku", věk = 18) {
    vypis("Ahoj " + jméno + ", je ti " + věk + " let");
}

// Rest parametry
funkce sečtiVše(...čísla) {
    proměnná suma = 0;
    pro_každý (číslo v čísla) {
        suma += číslo;
    }
    vrať suma;
}

vypis(sečtiVše(1, 2, 3, 4, 5));  // 15


// ----- Destructuring -----

proměnná [první, druhý, ...zbytek] = [1, 2, 3, 4, 5];
vypis(první);   // 1
vypis(druhý);   // 2
vypis(zbytek);  // [3, 4, 5]

proměnná osoba = { jméno: "Jan", věk: 25, město: "Praha" };
proměnná { jméno, věk } = osoba;
vypis(jméno);  // "Jan"
vypis(věk);    // 25


// ----- Template literals -----

proměnná jméno = "Jan";
proměnná věk = 25;
proměnná zpráva = `Jmenuji se ${jméno} a je mi ${věk} let.`;
vypis(zpráva);


// ----- Komplexní příklad: TodoList -----

třída TodoList {
    konstruktor() {
        tento.úkoly = načti("úkoly", []);
        tento.inicializuj();
    }
    
    inicializuj() {
        poNačtení(() => {
            tento.vykresli();
            
            poKliknutí("#přidat-úkol", () => {
                proměnná vstup = prvek("#nový-úkol");
                tento.přidejÚkol(vstup.value);
                vstup.value = "";
            });
        });
    }
    
    přidejÚkol(text) {
        když (jePrázdné(text)) vrať;
        
        proměnná úkol = {
            id: získejČas(),
            text: text,
            hotovo: nepravda
        };
        
        přidej(tento.úkoly, úkol);
        tento.ulož();
        tento.vykresli();
    }
    
    odeberÚkol(id) {
        proměnná index = najdi(tento.úkoly, u => u.id rovno id);
        odeber(tento.úkoly, index);
        tento.ulož();
        tento.vykresli();
    }
    
    přepniÚkol(id) {
        proměnná úkol = najdi(tento.úkoly, u => u.id rovno id);
        když (úkol) {
            úkol.hotovo = ne úkol.hotovo;
            tento.ulož();
            tento.vykresli();
        }
    }
    
    ulož() {
        ulož("úkoly", tento.úkoly);
    }
    
    vykresli() {
        proměnná seznam = prvek("#seznam-úkolů");
        seznam.innerHTML = "";
        
        pro_každý (úkol v tento.úkoly) {
            proměnná li = vytvoř("li");
            li.innerHTML = `
                <input type="checkbox" ${úkol.hotovo ? "checked" : ""}>
                <span>${úkol.text}</span>
                <button class="smazat">❌</button>
            `;
            
            poKliknutí(li.querySelector("input"), () => {
                tento.přepniÚkol(úkol.id);
            });
            
            poKliknutí(li.querySelector(".smazat"), () => {
                tento.odeberÚkol(úkol.id);
            });
            
            seznam.appendChild(li);
        }
    }
}

// Spuštění aplikace
proměnná app = nový TodoList();
