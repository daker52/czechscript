# 🇨🇿 CzechScript

<div align="center">

![CzechScript Logo](https://img.shields.io/badge/CzechScript-První%20český%20programovací%20jazyk-blue?style=for-the-badge)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.0-orange?style=for-the-badge)](https://github.com/daker52/czechscript)
[![Development](https://img.shields.io/badge/Development-1.5%20years-red?style=for-the-badge)](https://github.com/daker52/czechscript)

**První plně funkční programovací jazyk v češtině**  
*Rok a půl intenzivního vývoje • 7,000+ řádků kódu • Production ready*

[Dokumentace](#-dokumentace) • [Instalace](#-instalace) • [Příklady](#-příklady) • [VSCode Extension](#-vscode-extension) • [Přispívání](#-přispívání)

</div>

---

## 📖 O projektu

**CzechScript** je moderní, plně funkční programovací jazyk s **kompletní českou syntaxí**. Není to jen překlad - je to profesionální nástroj s vlastním kompilátorem, runtime prostředím a kompletním vývojářským toolchainem.

### 🎯 Motivace

Po roce a půl vývoje jsme vytvořili první produkčně připravený programovací jazyk v češtině. Cílem bylo umožnit českým vývojářům programovat v rodném jazyce bez kompromisů na funkcionalitě či výkonu.

### ✨ Klíčové vlastnosti

- 🇨🇿 **100% česká syntaxe** - klíčová slova, funkce, dokumentace
- 🚀 **Moderní funkce** - async/await, třídy, moduly, destructuring, spread operator
- 🛠️ **Profesionální nástroje** - REPL, linter, formatter, testing framework
- 🌐 **Web development** - vlastní web framework podobný Express.js
- 📦 **Package manager** - správa závislostí jako npm (cspkg)
- 🎨 **IDE podpora** - VSCode extension s IntelliSense a 70+ snippetů
- 🔧 **Build tools** - bundler, minifier, source maps
- 📚 **Bohatá knihovna** - 160+ vestavěných funkcí
- 🌍 **Online playground** - vyzkoušejte hned v prohlížeči
- 📊 **Production ready** - linting, testing, debugging

---

## 🚀 Rychlý start

### Instalace

```bash
npm install -g czechscript
```

### První program

Vytvořte soubor `hello.cs`:

```czechscript
funkce pozdrav(jméno) {
    vrať "Ahoj, " + jméno + "! 👋";
}

vypiš(pozdrav("světe"));
```

Spusťte:

```bash
czechscript run hello.cs
```

**Výstup:**
```
Ahoj, světe! 👋
```

---

## 📚 Dokumentace

### Základní syntaxe

#### Proměnné a konstanty

```czechscript
// Proměnné
proměnná jméno = "Jan";
proměnná věk = 25;

// Konstanty
konstanta PI = 3.14159;

// Let (blokový scope)
nechť počet = 10;
```

#### Funkce

```czechscript
// Klasická funkce
funkce sečti(a, b) {
    vrať a + b;
}

// Arrow funkce
konstanta odečti = (a, b) => a - b;

// Async funkce
async funkce načtiData() {
    proměnná odpověď = čekej načti("https://api.example.com/data");
    vrať čekej odpověď.json();
}

// Výchozí parametry
funkce pozdrav(jméno = "světe") {
    vypiš("Ahoj, " + jméno);
}

// Rest parametry
funkce součet(...čísla) {
    vrať čísla.reduce((a, b) => a + b, 0);
}
```

#### Třídy a OOP

```czechscript
třída Osoba {
    konstruktor(jméno, věk) {
        toto.jméno = jméno;
        toto.věk = věk;
    }
    
    představSe() {
        vypiš(`Ahoj, jsem ${toto.jméno} a je mi ${toto.věk} let.`);
    }
    
    // Getter
    get info() {
        vrať `${toto.jméno} (${toto.věk})`;
    }
    
    // Setter
    set věk(novýVěk) {
        když (novýVěk < 0) {
            vyhoď nový Chyba("Věk nemůže být záporný");
        }
        toto._věk = novýVěk;
    }
    
    // Statická metoda
    statická vytvoř(jméno, věk) {
        vrať nový Osoba(jméno, věk);
    }
}

třída Student rozšiřuje Osoba {
    konstruktor(jméno, věk, škola) {
        super(jméno, věk);
        toto.škola = škola;
    }
    
    představSe() {
        super.představSe();
        vypiš(`Studuji na ${toto.škola}.`);
    }
}

konstanta student = nový Student("Petr", 20, "VŠE");
student.představSe();
```

#### Podmínky a cykly

```czechscript
// If-else
když (věk >= 18) {
    vypiš("Dospělý");
} jinak když (věk >= 13) {
    vypiš("Teenager");
} jinak {
    vypiš("Dítě");
}

// Ternární operátor
konstanta stav = věk >= 18 ? "dospělý" : "nezletilý";

// Switch
přepni (den) {
    případ "pondělí":
        vypiš("Začátek týdne");
        přeruš;
    případ "pátek":
        vypiš("Skoro víkend!");
        přeruš;
    výchozí:
        vypiš("Běžný den");
}

// For cyklus
pro (nechť i = 0; i < 10; i++) {
    vypiš(i);
}

// For-of
pro (konstanta položka z pole) {
    vypiš(položka);
}

// For-in
pro (konstanta klíč v objektu) {
    vypiš(klíč, objektu[klíč]);
}

// While
dokud (počet > 0) {
    vypiš(počet);
    počet--;
}
```

#### Výjimky

```czechscript
zkus {
    proměnná výsledek = rizikovýKód();
    vypiš(výsledek);
} chyť (chyba) {
    vypisChybu("Nastala chyba:", chyba.zpráva);
} konečně {
    vypiš("Úklid dokončen.");
}

// Vyhodit vlastní chybu
když (!platný) {
    vyhoď nový Chyba("Neplatná hodnota");
}
```

#### Moduly (Import/Export)

```czechscript
// math.cs
export konstanta PI = 3.14159;
export konstanta E = 2.71828;

export funkce sečti(a, b) {
    vrať a + b;
}

export funkce kruh(poloměr) {
    vrať {
        obvod: 2 * PI * poloměr,
        obsah: PI * poloměr * poloměr
    };
}

export výchozí funkce násobek(a, b) {
    vrať a * b;
}
```

```czechscript
// app.cs
import násobek z "./math.cs";
import { PI, sečti, kruh } z "./math.cs";
import * jako Math z "./math.cs";

vypiš(násobek(5, 3)); // 15
vypiš(sečti(10, 20)); // 30
vypiš(kruh(5).obsah); // 78.539...
vypiš(Math.E); // 2.71828
```

#### Pokročilé funkce

```czechscript
// Destructuring objektů
konstanta osoba = { jméno: "Jan", věk: 25, město: "Praha" };
konstanta { jméno, věk } = osoba;

// Destructuring polí
konstanta [první, druhý, ...zbytek] = [1, 2, 3, 4, 5];

// Spread operator
konstanta pole1 = [1, 2, 3];
konstanta pole2 = [4, 5, 6];
konstanta spojené = [...pole1, ...pole2];

konstanta obj1 = { a: 1, b: 2 };
konstanta obj2 = { c: 3, ...obj1 };

// Template literals
konstanta jméno = "Jan";
konstanta věk = 25;
konstanta zpráva = `Jmenuji se ${jméno} a je mi ${věk} let.`;
```

---

## 🛠️ Vývojářské nástroje

### CLI nástroje

```bash
# Kompilace
czechscript compile app.cs

# Spuštění
czechscript run app.cs

# Watch mode (automatická rekompilace)
czechscript compile app.cs --watch

# Zobrazit AST
czechscript ast app.cs

# Zobrazit tokeny
czechscript tokens app.cs
```

### REPL (Interaktivní konzole)

```bash
czechscript repl
```

**Funkce:**
- ✅ Multi-line input s automatickou detekcí otevřených závorek
- ✅ Tab completion pro klíčová slova, funkce, proměnné
- ✅ Historie příkazů (↑/↓)
- ✅ Speciální příkazy:
  - `.help` - zobrazí nápovědu
  - `.save <soubor>` - uloží session do souboru
  - `.load <soubor>` - načte soubor
  - `.vars` - zobrazí všechny proměnné
  - `.clear` - vyčistí obrazovku
  - `.exit` - ukončí REPL
  - `.ast <kód>` - zobrazí AST
  - `.js <kód>` - zobrazí kompilovaný JavaScript
  - `.time <kód>` - změří čas vykonání

### Linter

```bash
# Zkontrolovat kvalitu kódu
czechscript lint src/**/*.cs

# S auto-opravou
czechscript lint src/**/*.cs --fix

# Vlastní pravidla
czechscript lint src/**/*.cs --max-depth 4 --max-function-length 50
```

**Kontroluje:**
- ✅ Hloubka vnoření (max 3-5 úrovní)
- ✅ Délka funkcí (doporučeno max 50 řádků)
- ✅ Počet parametrů (max 5)
- ✅ Konvence pojmenování (camelCase, PascalCase)
- ✅ Nepoužité proměnné
- ✅ Code smells (duplicity, složitost)
- ✅ Best practices

### Formatter

```bash
# Formátovat kód
czechscript format src/**/*.cs

# S vlastní konfigurací
czechscript format src/**/*.cs --indent 4 --quotes single --semicolons false

# Watch mode
czechscript format src/**/*.cs --watch
```

**Možnosti:**
- Velikost odsazení (2/4 mezery nebo tab)
- Styl uvozovek (single/double)
- Středníky (ano/ne)
- Mezery kolem operátorů
- Délka řádku

### Testing Framework

```czechscript
// testy/math.test.cs
import { očekávej, skupina, testuj, předKaždým, poKaždém } z "@czechscript/testing";

skupina("Matematické operace", () => {
    nechť kalkulačka;
    
    předKaždým(() => {
        kalkulačka = nový Kalkulačka();
    });
    
    testuj("sčítání funguje správně", () => {
        očekávej(kalkulačka.sečti(2, 2)).býtRovno(4);
        očekávej(kalkulačka.sečti(-1, 1)).býtRovno(0);
    });
    
    testuj("násobení funguje správně", () => {
        očekávej(kalkulačka.vynásob(3, 4)).býtRovno(12);
        očekávej(kalkulačka.vynásob(5, 0)).býtRovno(0);
    });
    
    testuj("dělení nulou vyhodí chybu", () => {
        očekávej(() => kalkulačka.vyděl(10, 0)).vyhoditChybu();
    });
    
    async testuj("async operace", async () => {
        konstanta výsledek = čekej kalkulačka.načtiData();
        očekávej(výsledek).nebýtNull();
        očekávej(výsledek.délka).býtVětšíNež(0);
    });
    
    poKaždém(() => {
        kalkulačka = null;
    });
});
```

**Spuštění:**
```bash
czechscript test

# Konkrétní test
czechscript test tests/math.test.cs

# S coverage
czechscript test --coverage

# Watch mode
czechscript test --watch
```

**Assertions:**
- `býtRovno(hodnota)` - přesná rovnost
- `nebýtRovno(hodnota)` - nerovnost
- `býtPravda()` - hodnota je true
- `býtNepravda()` - hodnota je false
- `býtNull()` - hodnota je null
- `nebýtNull()` - hodnota není null
- `býtNedefinováno()` - hodnota je undefined
- `obsahovat(hodnota)` - pole/string obsahuje hodnotu
- `vyhoditChybu()` - funkce vyhodí chybu
- `býtTypu(typ)` - kontrola typu
- `býtVětšíNež(n)` - číslo je větší než n
- `býtMenšíNež(n)` - číslo je menší než n

---

## 📦 Package Manager (cspkg)

### Inicializace projektu

```bash
cspkg init
```

Vytvoří `balíčky.json`:

```json
{
  "jméno": "můj-projekt",
  "verze": "1.0.0",
  "popis": "Můj CzechScript projekt",
  "hlavní": "index.cs",
  "autor": "Vaše jméno",
  "licence": "MIT",
  "skripty": {
    "spusť": "czechscript run index.cs",
    "build": "czechscript build --entry index.cs --output dist/bundle.js",
    "testuj": "czechscript test",
    "lint": "czechscript lint src/**/*.cs"
  },
  "závislosti": {},
  "vývojovéZávislosti": {}
}
```

### Správa balíčků

```bash
# Instalace balíčku
cspkg instaluj http-klient

# Instalace specifické verze
cspkg instaluj lodash@4.17.21

# Dev závislost
cspkg instaluj --dev testing-framework

# Odinstalování
cspkg odinstaluj http-klient

# Aktualizace všech balíčků
cspkg aktualizuj

# Seznam nainstalovaných balíčků
cspkg seznam

# Publikování vlastního balíčku
cspkg publikuj
```

### Scripty

```bash
# Spuštění skriptu
cspkg spuť start
cspkg spuť build
cspkg spuť testuj
```

---

## 🌐 Web Framework

CzechScript obsahuje vlastní web framework inspirovaný Express.js:

```czechscript
import { vytvořAplikaci } z "@czechscript/web";

konstanta app = vytvořAplikaci();

// GET endpoint
app.get("/", (req, res) => {
    res.odešliHTML("<h1>Vítejte v CzechScript! 🚀</h1>");
});

// GET s parametry
app.get("/uživatel/:id", (req, res) => {
    konstanta id = req.parametry.id;
    res.odešliJSON({ id: id, jméno: "Jan Novák" });
});

// POST endpoint
app.post("/api/data", (req, res) => {
    konstanta data = req.tělo;
    
    // Zpracování dat
    vypiš("Přijata data:", data);
    
    res.odešliJSON({
        úspěch: pravda,
        zpráva: "Data byla úspěšně zpracována",
        data: data
    });
});

// PUT, DELETE
app.put("/api/položka/:id", (req, res) => {
    // Aktualizace položky
});

app.smaž("/api/položka/:id", (req, res) => {
    // Smazání položky
});

// Statické soubory
app.statické("/veřejné", "./public");
app.statické("/assets", "./assets");

// Middleware
app.použij((req, res, další) => {
    vypiš(`[${nový Date().toISOString()}] ${req.metoda} ${req.cesta}`);
    další();
});

// CORS
app.cors({
    původ: "*",
    metody: ["GET", "POST", "PUT", "DELETE"],
    hlavičky: ["Content-Type", "Authorization"]
});

// Autentizace middleware
app.použij("/api/*", (req, res, další) => {
    konstanta token = req.hlavičky["authorization"];
    
    když (!token) {
        res.stav(401).odešliJSON({ chyba: "Nepřihlášen" });
        vrať;
    }
    
    // Ověření tokenu
    když (ověřToken(token)) {
        req.uživatel = dekódujToken(token);
        další();
    } jinak {
        res.stav(403).odešliJSON({ chyba: "Neplatný token" });
    }
});

// Error handling
app.použij((err, req, res, další) => {
    vypisChybu("Chyba:", err);
    res.stav(500).odešliJSON({
        chyba: "Interní chyba serveru",
        zpráva: err.zpráva
    });
});

// Spuštění serveru
konstanta PORT = 3000;
app.spusť(PORT, () => {
    vypiš(`🌐 Server běží na http://localhost:${PORT}`);
});
```

### Kompletní API příklad

```czechscript
import { vytvořAplikaci } z "@czechscript/web";

konstanta app = vytvořAplikaci();
proměnná úkoly = [];
proměnná aktuálníId = 1;

// Získat všechny úkoly
app.get("/api/úkoly", (req, res) => {
    res.odešliJSON(úkoly);
});

// Získat jeden úkol
app.get("/api/úkoly/:id", (req, res) => {
    konstanta úkol = úkoly.najdi(u => u.id == req.parametry.id);
    
    když (úkol) {
        res.odešliJSON(úkol);
    } jinak {
        res.stav(404).odešliJSON({ chyba: "Úkol nenalezen" });
    }
});

// Vytvořit nový úkol
app.post("/api/úkoly", (req, res) => {
    konstanta nový = {
        id: aktuálníId++,
        text: req.tělo.text,
        hotovo: nepravda,
        vytvořeno: nový Date()
    };
    
    úkoly.push(nový);
    res.stav(201).odešliJSON(nový);
});

// Aktualizovat úkol
app.put("/api/úkoly/:id", (req, res) => {
    konstanta úkol = úkoly.najdi(u => u.id == req.parametry.id);
    
    když (úkol) {
        úkol.text = req.tělo.text ?? úkol.text;
        úkol.hotovo = req.tělo.hotovo ?? úkol.hotovo;
        res.odešliJSON(úkol);
    } jinak {
        res.stav(404).odešliJSON({ chyba: "Nenalezeno" });
    }
});

// Smazat úkol
app.smaž("/api/úkoly/:id", (req, res) => {
    konstanta index = úkoly.najdiIndex(u => u.id == req.parametry.id);
    
    když (index !== -1) {
        úkoly.splice(index, 1);
        res.odešliJSON({ úspěch: pravda });
    } jinak {
        res.stav(404).odešliJSON({ chyba: "Nenalezeno" });
    }
});

app.spusť(3000);
```

---

## 📦 Build Tools

### Bundler

```bash
# Základní bundle
czechscript build --entry src/index.cs --output dist/bundle.js

# S minifikací
czechscript build --entry src/index.cs --output dist/bundle.js --minify

# Se source maps
czechscript build --entry src/index.cs --output dist/bundle.js --source-map

# Watch mode
czechscript build --entry src/index.cs --output dist/bundle.js --watch

# Vše najednou
czechscript build --entry src/index.cs --output dist/bundle.js --minify --source-map --watch
```

**Funkce bundleru:**
- ✅ **Tree-shaking** - odstranění nepoužitého kódu
- ✅ **Minifikace** - zmenšení velikosti výstupu
- ✅ **Source maps** - mapování pro debugging
- ✅ **Module loader** - automatický systém pro moduly
- ✅ **Watch mode** - automatické přebuildování
- ✅ **Dependency resolution** - řešení závislostí

---

## 📚 Standard Library

### Math (40+ funkcí)

```czechscript
import { 
    odmocnina, mocnina, absolutní, zaokrouhli,
    faktoriál, fibonacci, prvočíslo,
    průměr, medián, rozptyl, směrodatná,
    sin, cos, tan, asin, acos, atan,
    logaritmus, exp, náhodné
} z "@czechscript/math";

// Základní matematika
vypiš(odmocnina(16)); // 4
vypiš(mocnina(2, 10)); // 1024
vypiš(absolutní(-5)); // 5

// Pokročilé funkce
vypiš(faktoriál(5)); // 120
vypiš(fibonacci(10)); // 55
vypiš(prvočíslo(17)); // true

// Statistika
konstanta čísla = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
vypiš(průměr(čísla)); // 5.5
vypiš(medián(čísla)); // 5.5
vypiš(směrodatná(čísla)); // 2.87

// Trigonometrie
vypiš(sin(90)); // 1 (ve stupních)
vypiš(cos(0)); // 1

// Náhodná čísla
vypiš(náhodné(1, 100)); // náhodné číslo 1-100
```

### String (35+ funkcí)

```czechscript
import { 
    ořež, naMalá, naVelká, nahraď, rozděl,
    jeEmail, jeURL, jeCíslo, jeTelefon,
    camelCase, snakeCase, kebabCase, slugify,
    odstraňDiakritiku, podobnost, uuid,
    zahrnuje, začínáNa, končíNa
} z "@czechscript/string";

// Transformace
vypiš(naMalá("AHOJ")); // "ahoj"
vypiš(naVelká("ahoj")); // "AHOJ"
vypiš(ořež("  text  ")); // "text"

// Validace
vypiš(jeEmail("test@example.com")); // true
vypiš(jeURL("https://czechscript.cz")); // true
vypiš(jeTelefon("+420123456789")); // true

// Formátování
vypiš(slugify("Ahoj Světe!")); // "ahoj-svete"
vypiš(camelCase("ahoj_svete")); // "ahojSvete"
vypiš(snakeCase("ahojSvete")); // "ahoj_svete"
vypiš(kebabCase("Ahoj Světe")); // "ahoj-svete"

// Další
vypiš(odstraňDiakritiku("Příliš žluťoučký kůň")); // "Prilis zlutoucky kun"
vypiš(uuid()); // "550e8400-e29b-41d4-a716-446655440000"
vypiš(podobnost("ahoj", "ohaj")); // 0.75
```

### File (20+ funkcí)

```czechscript
import { 
    přečtiSoubor, zapisSoubor, připojText,
    kopíruj, přesuň, smaž, existuje,
    vytvořAdresář, čtiAdresář, sleduj,
    přečtiJSON, zapisJSON
} z "@czechscript/file";

// Synchronní operace
konstanta obsah = přečtiSoubor("data.txt");
zapisSoubor("output.txt", "Hello World");

// Asynchronní operace
async funkce zpracujSoubory() {
    zkus {
        konstanta data = čekej přečtiSouborAsync("data.json");
        konstanta parsed = JSON.parse(data);
        
        čekej zapisSouborAsync("output.json", JSON.stringify(parsed));
        vypiš("✅ Soubor zpracován");
    } chyť (chyba) {
        vypisChybu("Chyba:", chyba);
    }
}

// Práce s adresáři
když (!existuje("./output")) {
    vytvořAdresář("./output");
}

konstanta soubory = čtiAdresář("./src");
pro (konstanta soubor z soubory) {
    vypiš(soubor);
}

// Sledování změn
sleduj("./src", (událost, soubor) => {
    vypiš(`Soubor ${soubor} byl ${událost}`);
});

// JSON helper
konstanta config = přečtiJSON("config.json");
config.verze = "2.0.0";
zapisJSON("config.json", config);
```

### HTTP (15+ funkcí)

```czechscript
import { 
    načti, get, post, put, delete,
    vytvořServer, vytvořWebSocket
} z "@czechscript/http";

// Fetch API (GET)
async funkce načtiUživatele() {
    zkus {
        konstanta odpověď = čekej načti("https://api.example.com/users");
        
        když (!odpověď.ok) {
            vyhoď nový Chyba(`HTTP chyba: ${odpověď.status}`);
        }
        
        konstanta data = čekej odpověď.json();
        vrať data;
    } chyť (chyba) {
        vypisChybu("Chyba při načítání:", chyba);
        vrať null;
    }
}

// POST request
async funkce vytvoř Uživatele(uživatel) {
    konstanta odpověď = čekej post("https://api.example.com/users", {
        tělo: JSON.stringify(uživatel),
        hlavičky: {
            "Content-Type": "application/json",
            "Authorization": "Bearer token123"
        }
    });
    
    vrať čekej odpověď.json();
}

// PUT request
async funkce aktualizujUživatele(id, data) {
    konstanta odpověď = čekej put(`https://api.example.com/users/${id}`, {
        tělo: JSON.stringify(data),
        hlavičky: { "Content-Type": "application/json" }
    });
    
    vrať čekej odpověď.json();
}

// DELETE request
async funkce smažUživatele(id) {
    konstanta odpověď = čekej delete(`https://api.example.com/users/${id}`);
    vrať odpověď.ok;
}

// WebSocket
konstanta ws = vytvořWebSocket("ws://localhost:8080");

ws.při("otevřeno", () => {
    vypiš("Připojeno k serveru");
    ws.odešli("Ahoj servere!");
});

ws.při("zpráva", (data) => {
    vypiš("Přijato:", data);
});

ws.při("zavřeno", () => {
    vypiš("Odpojeno");
});

ws.při("chyba", (err) => {
    vypisChybu("WebSocket chyba:", err);
});
```

---

## 🎨 VSCode Extension

### Instalace

1. Otevřete VSCode
2. Stiskněte `Ctrl+P` (nebo `Cmd+P` na Macu)
3. Zadejte: `ext install czechscript`
4. Nebo nainstalujte z marketplace: [CzechScript Extension](https://marketplace.visualstudio.com/items?itemName=daker52.czechscript)

### Funkce

- ✅ **Syntax highlighting** - plné barevné zvýraznění CzechScript syntaxe
- ✅ **IntelliSense** - automatické dokončování kódu
- ✅ **70+ code snippets** - rychlé šablony pro běžné úkoly
- ✅ **Error diagnostics** - chyby a varování přímo v editoru
- ✅ **Formatting** - automatické formátování kódu
- ✅ **Hover info** - dokumentace při najetí myší
- ✅ **Go to definition** - přechod na definici funkce/třídy
- ✅ **Find references** - hledání všech použití
- ✅ **Rename symbol** - přejmenování s aktualizací všech výskytů

### Příkazy (Ctrl+Shift+P)

- `CzechScript: Compile` - kompilovat aktuální soubor
- `CzechScript: Run` - spustit aktuální soubor
- `CzechScript: Format` - naformátovat soubor
- `CzechScript: Show AST` - zobrazit AST aktuálního souboru
- `CzechScript: Lint` - zkontrolovat kvalitu kódu

### Code Snippets

Zadejte prefix a stiskněte `Tab`:

**Základní:**
- `funkce` → funkce šablona
- `async` → async funkce
- `třída` → třída šablona
- `když` → if-else
- `přepni` → switch statement
- `pro` → for cyklus
- `pro-z` → for-of cyklus
- `dokud` → while cyklus
- `zkus` → try-catch-finally

**Pokročilé:**
- `arrow` → arrow funkce
- `async-arrow` → async arrow funkce
- `destr-obj` → destrukturování objektu
- `destr-pole` → destrukturování pole
- `spread` → spread operator
- `rest` → rest parametry
- `getter` → getter method
- `setter` → setter method
- `statická` → statická metoda

**Web Development:**
- `http-get` → HTTP GET request
- `http-post` → HTTP POST request
- `route-get` → Express-style GET route
- `route-post` → Express-style POST route
- `middleware` → Express middleware

**Testing:**
- `test` → test case
- `test-async` → async test
- `test-skupina` → test group
- `mock` → mock funkce

---

## 🌍 Online Playground

Vyzkoušejte CzechScript přímo v prohlížeči bez instalace!

👉 **[czechscript-playground.netlify.app](https://czechscript-playground.netlify.app)**

**Funkce:**
- ✅ Live editor s syntax highlighting
- ✅ Okamžité spuštění kódu
- ✅ Knihovna příkladů (kalkulačka, TODO list, API, atd.)
- ✅ Sdílení kódu přes URL
- ✅ Export do .cs souboru
- ✅ Zobrazení kompilovaného JavaScriptu

---

## 📊 Příklady

### Kalkulačka

```czechscript
třída Kalkulačka {
    sečti(a, b) { vrať a + b; }
    odečti(a, b) { vrať a - b; }
    vynásob(a, b) { vrať a * b; }
    
    vyděl(a, b) {
        když (b === 0) {
            vyhoď nový Chyba("Dělení nulou není povoleno!");
        }
        vrať a / b;
    }
    
    mocnina(základ, exponent) {
        vrať Math.pow(základ, exponent);
    }
    
    odmocnina(číslo) {
        když (číslo < 0) {
            vyhoď nový Chyba("Nelze vypočítat odmocninu ze záporného čísla!");
        }
        vrať Math.sqrt(číslo);
    }
}

konstanta calc = nový Kalkulačka();

vypiš(calc.sečti(10, 5)); // 15
vypiš(calc.vynásob(7, 8)); // 56
vypiš(calc.odmocnina(144)); // 12
```

### TODO List s úložištěm

```czechscript
import { načti, ulož } z "@czechscript/storage";

třída TodoList {
    konstruktor() {
        toto.úkoly = toto.načtiZÚložiště();
    }
    
    přidat(text) {
        konstanta úkol = {
            id: Date.now(),
            text: text,
            hotovo: nepravda,
            vytvořeno: nový Date()
        };
        
        toto.úkoly.push(úkol);
        toto.uložitDoÚložiště();
        vrať úkol;
    }
    
    označitJakoHotové(id) {
        konstanta úkol = toto.úkoly.najdi(u => u.id === id);
        když (úkol) {
            úkol.hotovo = !úkol.hotovo;
            toto.uložitDoÚložiště();
        }
    }
    
    smazat(id) {
        konstanta index = toto.úkoly.najdiIndex(u => u.id === id);
        když (index !== -1) {
            toto.úkoly.splice(index, 1);
            toto.uložitDoÚložiště();
        }
    }
    
    získatVšechny() {
        vrať toto.úkoly;
    }
    
    získatAktivní() {
        vrať toto.úkoly.filtruj(u => !u.hotovo);
    }
    
    získatDokončené() {
        vrať toto.úkoly.filtruj(u => u.hotovo);
    }
    
    načtiZÚložiště() {
        konstanta data = načti("todoList");
        vrať data ? JSON.parse(data) : [];
    }
    
    uložitDoÚložiště() {
        ulož("todoList", JSON.stringify(toto.úkoly));
    }
}

// Použití
konstanta todo = nový TodoList();

todo.přidat("Nakoupit potraviny");
todo.přidat("Zavolat doktorovi");
todo.přidat("Napsat dokumentaci");

vypiš("Aktivní úkoly:", todo.získatAktivní());
```

### REST API Server

```czechscript
import { vytvořAplikaci } z "@czechscript/web";
import { přečtiJSON, zapisJSON } z "@czechscript/file";

konstanta app = vytvořAplikaci();
konstanta DB_SOUBOR = "./database.json";

// Načti databázi
funkce načtiDB() {
    zkus {
        vrať přečtiJSON(DB_SOUBOR);
    } chyť {
        vrať { uživatelé: [], články: [] };
    }
}

// Ulož databázi
funkce uložDB(data) {
    zapisJSON(DB_SOUBOR, data);
}

// Middleware - Logování
app.použij((req, res, další) => {
    konstanta čas = nový Date().toISOString();
    vypiš(`[${čas}] ${req.metoda} ${req.cesta}`);
    další();
});

// CORS
app.cors({ původ: "*" });

// Routes

// Získat všechny uživatele
app.get("/api/uživatelé", (req, res) => {
    konstanta db = načtiDB();
    res.odešliJSON(db.uživatelé);
});

// Získat jednoho uživatele
app.get("/api/uživatelé/:id", (req, res) => {
    konstanta db = načtiDB();
    konstanta uživatel = db.uživatelé.najdi(u => u.id == req.parametry.id);
    
    když (uživatel) {
        res.odešliJSON(uživatel);
    } jinak {
        res.stav(404).odešliJSON({ chyba: "Uživatel nenalezen" });
    }
});

// Vytvořit uživatele
app.post("/api/uživatelé", (req, res) => {
    konstanta db = načtiDB();
    
    konstanta novýUživatel = {
        id: Date.now(),
        jméno: req.tělo.jméno,
        email: req.tělo.email,
        vytvořeno: nový Date()
    };
    
    db.uživatelé.push(novýUživatel);
    uložDB(db);
    
    res.stav(201).odešliJSON(novýUživatel);
});

// Aktualizovat uživatele
app.put("/api/uživatelé/:id", (req, res) => {
    konstanta db = načtiDB();
    konstanta uživatel = db.uživatelé.najdi(u => u.id == req.parametry.id);
    
    když (uživatel) {
        uživatel.jméno = req.tělo.jméno ?? uživatel.jméno;
        uživatel.email = req.tělo.email ?? uživatel.email;
        uložDB(db);
        res.odešliJSON(uživatel);
    } jinak {
        res.stav(404).odešliJSON({ chyba: "Nenalezeno" });
    }
});

// Smazat uživatele
app.smaž("/api/uživatelé/:id", (req, res) => {
    konstanta db = načtiDB();
    konstanta index = db.uživatelé.najdiIndex(u => u.id == req.parametry.id);
    
    když (index !== -1) {
        db.uživatelé.splice(index, 1);
        uložDB(db);
        res.odešliJSON({ úspěch: pravda });
    } jinak {
        res.stav(404).odešliJSON({ chyba: "Nenalezeno" });
    }
});

// Error handling
app.použij((err, req, res, další) => {
    vypisChybu(err);
    res.stav(500).odešliJSON({ chyba: "Interní chyba serveru" });
});

// Spuštění
konstanta PORT = 3000;
app.spusť(PORT, () => {
    vypiš(`🚀 API server běží na http://localhost:${PORT}`);
});
```

---

## 🏗️ Architektura

```
┌─────────────────────────────────────────┐
│     CzechScript Source Code (.cs)       │
└─────────────────┬───────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│         Lexer (Tokenizace)              │
│  - Rozpoznání českých klíčových slov    │
│  - Podpora diakritiky (áčďéěíňóřšťúůýž) │
└─────────────────┬───────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│         Parser (AST generování)         │
│  - Syntaktická analýza                  │
│  - Vytvoření abstraktního stromu        │
└─────────────────┬───────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│       Semantic Analysis                 │
│  - Typová kontrola                      │
│  - Scope resolution                     │
│  - Constant folding                     │
│  - Dead code elimination                │
└─────────────────┬───────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│         Code Generator                  │
│  - Transpilace do JavaScriptu           │
│  - Optimalizace kódu                    │
│  - Generování source maps               │
└─────────────────┬───────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│   JavaScript Output + Source Map        │
│        (.js + .js.map files)            │
└─────────────────────────────────────────┘
```

### Optimalizace

- ✅ **Constant folding** - vyhodnocení konstant v compile time
- ✅ **Dead code elimination** - odstranění nedosažitelného kódu
- ✅ **Tree shaking** - odstranění nepoužitých modulů
- ✅ **Minifikace** - zmenšení velikosti výstupu
- ✅ **Source maps** - mapování pro debugging

---

## 📈 Statistiky

### Řádky kódu
- **~7,000+** řádků produkčního kódu
- **20+** hlavních souborů
- **200+** funkcí
- **160+** built-in funkcí ve stdlib
- **15+** tříd
- **70+** code snippets pro VSCode
- **30+** unit testů

### Komponenty
- **Lexer**: ~300 řádků
- **Parser**: ~800 řádků
- **Code Generator**: ~400 řádků
- **Compiler**: ~250 řádků
- **Standard Library**: ~1,500 řádků
- **Development Tools**: ~1,450 řádků
- **Build Tools**: ~1,000 řádků
- **IDE Support**: ~1,150 řádků
- **Online Playground**: ~600 řádků

### Vývoj
- **⏱️ 1.5 roku intenzivního vývoje** (2024-2026)
- **🎯 První stabilní verze**: 1.0.0
- **📅 Release**: Leden 2026

---

## 🗺️ Roadmap

### ✅ Verze 1.0 (HOTOVO - Leden 2026)
- ✅ Core compiler (Lexer, Parser, CodeGen, Semantic Analysis)
- ✅ Standard library (Math, String, File, HTTP modules)
- ✅ CLI tools (compile, run, watch, ast, tokens)
- ✅ REPL s multi-line a tab completion
- ✅ Testing framework s assertions a mocks
- ✅ Linter a Formatter
- ✅ VSCode extension s 70+ snippety
- ✅ Web framework (Express-like)
- ✅ Package manager (cspkg)
- ✅ Build tools (bundler, minifier)
- ✅ Language Server Protocol
- ✅ Documentation generator
- ✅ Online playground
- ✅ Source maps pro debugging
- ✅ České error messages s návrhy

### 🔜 Verze 1.1 (Q2 2026)
- [ ] Debugger protokol (DAP - Debug Adapter Protocol)
- [ ] Performance profiler
- [ ] Code coverage nástroj
- [ ] Plugin systém pro rozšíření
- [ ] Více příkladových projektů
- [ ] Video tutoriály
- [ ] Interaktivní dokumentace

### 🔮 Verze 2.0 (Q3-Q4 2026)
- [ ] **Type system** - volitelné statické typování
- [ ] Kompilace do **WebAssembly**
- [ ] **Native binaries** - standalone spustitelné soubory
- [ ] Multi-threading podpora
- [ ] GPU computing API
- [ ] Database ORM v češtině
- [ ] GraphQL klient/server
- [ ] Real-time collaboration editor

### 🚀 Dlouhodobá vize
- [ ] Self-hosting - compiler napsaný v CzechScript
- [ ] JIT compiler pro lepší výkon
- [ ] Browser extension pro přímé spouštění .cs souborů
- [ ] Mobile IDE (iOS/Android)
- [ ] Cloud-based vývojové prostředí
- [ ] Integrované AI asistenty pro český kód

---

## 🤝 Přispívání

Příspěvky jsou vítány! CzechScript je open-source projekt a uvítáme pomoc od komunity.

### Jak přispět

1. **Fork** tento repozitář
2. Vytvořte **feature branch**:
   ```bash
   git checkout -b feature/nova-funkce
   ```
3. **Commitněte** změny:
   ```bash
   git commit -m 'Přidána nová funkce XYZ'
   ```
4. **Pushněte** do branchi:
   ```bash
   git push origin feature/nova-funkce
   ```
5. Otevřete **Pull Request**

### Coding Standards

- ✅ Používejte **české názvy** proměnných a funkcí
- ✅ Dodržujte **existující styl kódu**
- ✅ Přidejte **testy** pro nové funkce
- ✅ Aktualizujte **dokumentaci**
- ✅ Komentáře v **češtině**
- ✅ Commits v češtině (preferovaně) nebo angličtině

### Oblasti pro příspěvky

- 🐛 **Bug fixes** - opravy chyb
- ✨ **Nové funkce** - rozšíření standard library
- 📝 **Dokumentace** - vylepšení dokumentace
- 🎨 **Design** - UI/UX improvements pro playground
- 🧪 **Testy** - více unit a integration testů
- 🌍 **Překlady** - lokalizace error messages
- 📦 **Balíčky** - community balíčky pro cspkg

### Hlášení chyb

Našli jste chybu? [Otevřete issue](https://github.com/daker52/czechscript/issues/new) s:

- ✅ **Popisem problému** - co se děje vs. co by se mělo dít
- ✅ **Kroky k reprodukci** - jak chybu vyvolat
- ✅ **Verze CzechScript** - výstup z `czechscript --version`
- ✅ **Operační systém** - Windows, macOS, Linux
- ✅ **Příklad kódu** - minimální reproducible example
- ✅ **Error message** - celá chybová hláška

---

## 📄 Licence

Tento projekt je licencován pod **MIT licencí** - viz soubor [LICENSE](LICENSE) pro detaily.

### Copyright © 2026 daker52

**Autorství:** daker52  
**Použití:** Volné (MIT License)  
**Původní nápad a implementace:** daker52  
**Vývoj:** Rok a půl intenzivní práce (2024-2026)

#### Práva a omezení

✅ **Povoleno:**
- Komerční využití
- Modifikace
- Distribuce
- Soukromé použití

❌ **Vyžadováno:**
- Zachování copyright notice
- Zachování licence ve všech kopiích
- Uvedení původního autora

⚠️ **Omezení:**
- Software je poskytován "jak je" bez záruky
- Autor není odpovědný za škody
- Nikdo nemůže nárokovat autorství původního nápadu

---

## 👨‍💻 Autor

**daker52** - Tvůrce CzechScript

- 🐙 GitHub: [@daker52](https://github.com/daker52)
- 📦 Repository: [github.com/daker52/czechscript](https://github.com/daker52/czechscript)
- 🌍 Playground: [czechscript-playground.netlify.app](https://czechscript-playground.netlify.app)
- 📧 Email: czechscript@example.com

### Motivace autora

> "Chtěl jsem vytvořit programovací jazyk, který by byl plně v češtině a zároveň nabízel všechny moderní funkce. Po roce a půl vývoje jsem vytvořil CzechScript - první produkčně připravený český programovací jazyk s kompletním toolchainem."
> 
> — daker52, Leden 2026

---

## 🙏 Poděkování

- **Open-source komunitě** za inspiraci a nástroje
- **Všem testerům** za zpětnou vazbu a hlášení chyb
- **České programátorské komunitě** za podporu
- **Přispěvatelům** za pull requesty a nápady
- **Vám** za zájem o CzechScript! 🎉

---

## 📞 Kontakt & Podpora

### Otázky a diskuze
- 💬 **Discussions:** [GitHub Discussions](https://github.com/daker52/czechscript/discussions)
- 🐛 **Issues:** [GitHub Issues](https://github.com/daker52/czechscript/issues)
- 📧 **Email:** czechscript@example.com

### Dokumentace a zdroje
- 📚 **Dokumentace:** [github.com/daker52/czechscript/wiki](https://github.com/daker52/czechscript/wiki)
- 🌍 **Playground:** [czechscript-playground.netlify.app](https://czechscript-playground.netlify.app)
- 🎨 **VSCode Extension:** [marketplace.visualstudio.com](https://marketplace.visualstudio.com/items?itemName=daker52.czechscript)

### Sociální sítě
- 🐦 **Twitter:** [@czechscript](https://twitter.com/czechscript)
- 💼 **LinkedIn:** [CzechScript](https://linkedin.com/company/czechscript)

---

<div align="center">

## 🌟 Podporujte projekt!

**Vyrobeno s ❤️ v České republice 🇨🇿**

*Rok a půl vývoje • 7,000+ řádků kódu • První plně funkční český programovací jazyk*

---

⭐ **Pokud se vám CzechScript líbí, dejte hvězdičku na GitHubu!** ⭐

[![Star History Chart](https://api.star-history.com/svg?repos=daker52/czechscript&type=Date)](https://github.com/daker52/czechscript)

---

[⬆ Zpět nahoru](#-czechscript)

</div>
