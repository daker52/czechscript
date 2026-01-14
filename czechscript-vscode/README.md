# CzechScript Language Support

<p align="center">
  <img src="https://img.shields.io/badge/VSCode-Extension-blue" alt="VSCode">
  <img src="https://img.shields.io/badge/jazyk-Čeština-red" alt="Jazyk">
  <img src="https://img.shields.io/badge/verze-1.0.0-green" alt="Verze">
</p>

**Oficiální VSCode rozšíření pro CzechScript** - programovací jazyk v češtině!

## ✨ Funkce

### 🎨 Syntax Highlighting
- Plné zvýraznění české syntaxe
- Podpora pro všechny klíčová slova (proměnná, funkce, třída...)
- Rozlišení komentářů, řetězců a čísel
- Speciální barvy pro logické operátory (a, nebo, ne...)

### 📝 IntelliSense & Snippets
- **70+ snippetů** pro rychlé psaní kódu (základní, pokročilé, web, testy)
- Automatické dokončování klíčových slov
- Nápověda pro funkce a třídy
- Quick fix návrhy

### 🔧 Nástroje
- **Kompilace** (`Ctrl+Shift+B`) - zkompiluje soubor do JavaScriptu
- **Spuštění** (`Ctrl+Shift+R`) - zkompiluje a spustí
- **AST Viewer** - zobrazí Abstract Syntax Tree
- **Nový soubor** - vytvoří CzechScript soubor ze šablony

### ⚙️ Konfigurace
- Nastavitelná cesta k compileru
- Volitelné optimalizace
- Striktní režim
- Automatické formátování

## 🚀 Rychlý start

### Instalace rozšíření

1. Otevřete VSCode
2. Stiskněte `Ctrl+Shift+X` (Extensions)
3. Vyhledejte "CzechScript"
4. Klikněte na "Install"

### První kroky

1. Vytvořte nový soubor s příponou `.cs`
2. Začněte psát CzechScript kód
3. Využívejte snippety (zadejte např. `funkce` a stiskněte Tab)
4. Kompilujte: `Ctrl+Shift+B`
5. Spusťte: `Ctrl+Shift+R`

## 📚 Snippety

### Základní konstrukce

| Prefix | Popis | Výsledek |
|--------|-------|----------|
| `pro` | Proměnná | `proměnná název = hodnota;` |
| `kon` | Konstanta | `konstanta NÁZEV = hodnota;` |
| `funkce` | Funkce | Kompletní funkce s parametry |
| `arrow` | Arrow funkce | `(params) => expr` |
| `třída` | Třída | Kompletní třída s konstruktorem |

### Podmínky a cykly

| Prefix | Popis | Výsledek |
|--------|-------|----------|
| `když` | If podmínka | `když (podmínka) pak { }` |
| `když-jinak` | If-else | Kompletní if-else |
| `dokud` | While | `dokud (podmínka) { }` |
| `pro-každý` | For-each | `pro_každý (položka v pole) { }` |
| `opakuj` | Opakuj N-krát | `opakuj (N) { }` |

### DOM Manipulace

| Prefix | Popis | Výsledek |
|--------|-------|----------|
| `prvek` | Získat element | `prvek('#selector')` |
| `prvky` | Získat elementy | `prvky('.selector')` |
| `klik` | Event listener | `poKliknutí(element, ...)` |
| `načtení` | DOMContentLoaded | `poNačtení(...)` |

### Async operace

| Prefix | Popis | Výsledek |
|--------|-------|----------|
| `async` | Async funkce | Kompletní async funkce |
| `await` | Await | `await promise` |
| `fetch-get` | GET request | Kompletní fetch s error handlingem |
| `fetch-post` | POST request | Kompletní POST request |

### Storage

| Prefix | Popis | Výsledek |
|--------|-------|----------|
| `ulož` | LocalStorage save | `ulož('klíč', hodnota)` |
| `načti` | LocalStorage load | `načti('klíč')` |

## ⌨️ Klávesové zkratky

- `Ctrl+Shift+B` - Zkompilovat soubor
- `Ctrl+Shift+R` - Spustit soubor
- `Tab` - Rozbalit snippet
- `Ctrl+Space` - Zobrazit návrhy

## ⚙️ Nastavení

Přejděte do `File > Preferences > Settings` a vyhledejte "CzechScript":

```json
{
  "czechscript.compiler.path": "czechscript",
  "czechscript.compiler.optimize": true,
  "czechscript.compiler.strict": false,
  "czechscript.format.enable": true,
  "czechscript.format.indentSize": 4
}
```

### Možnosti

- **compiler.path** - Cesta k CzechScript compileru (výchozí: `czechscript`)
- **compiler.optimize** - Povolit optimalizace (výchozí: `true`)
- **compiler.strict** - Striktní režim s více kontrolami (výchozí: `false`)
- **format.enable** - Automatické formátování (výchozí: `true`)
- **format.indentSize** - Velikost odsazení (výchozí: `4`)

## 🎨 Theme Support

Rozšíření podporuje všechny barevné motivy VSCode. Pro nejlepší výsledky doporučujeme:

- Dark+ (default dark)
- Monokai
- Dracula
- One Dark Pro

## 📖 Příklady kódu

### Hello World

```czechscript
funkce pozdrav(jméno) {
    vrať "Ahoj, " + jméno + "!";
}

vypis(pozdrav("světe"));
```

### Třída s metodami

```czechscript
třída Kalkulačka {
    konstruktor() {
        tento.výsledek = 0;
    }
    
    sečti(a, b) {
        vrať a + b;
    }
    
    odečti(a, b) {
        vrať a - b;
    }
}

proměnná kalk = nový Kalkulačka();
vypis(kalk.sečti(5, 3)); // 8
```

### Async/Await

```czechscript
async funkce získejUživatele() {
    zkus {
        proměnná data = await načtiData("https://api.example.com/users");
        pro_každý (uživatel v data) {
            vypis(uživatel.jméno);
        }
    } chyť (chyba) {
        vypisChybu("Chyba:", chyba);
    }
}
```

## 🐛 Hlášení chyb

Našli jste chybu? Otevřete issue na GitHubu:

👉 [https://github.com/daker52/czechscript-vscode/issues](https://github.com/daker52/czechscript-vscode/issues)

## 🤝 Přispívání

Příspěvky jsou vítány! 

1. Forkněte repo
2. Vytvořte feature branch
3. Commitněte změny
4. Otevřete Pull Request

## 📝 Changelog

### 1.0.0 (2026-01-14)

**🎉 První stabilní vydání po 1.5 letech vývoje! (2024-2026)**

- ✨ Kompletní CzechScript IDE podpora
- 🎨 Plná syntax highlighting s podporou všech konstrukcí
- 📝 **70+ profesionálních code snippetů** (základní, pokročilé, web, testy)
- 🔧 Příkazy pro kompilaci, spuštění a debugging
- ⚙️ Konfigurovatelné nastavení pro formátování a linting
- 🧠 IntelliSense s automatickým dokončováním
- 🔍 Go to Definition, Find References, Rename
- 📊 Diagnostika chyb v reálném čase
- 📚 Hover dokumentace pro všechny funkce
- 🚀 Integrace s Language Server Protocol

## 📄 Licence

MIT © 2026 daker52

## 🔗 Užitečné odkazy

- 📚 [CzechScript Dokumentace](https://github.com/daker52/czechscript)
- 💬 [Diskuze](https://github.com/daker52/czechscript/discussions)
- 🐦 [Twitter](https://twitter.com/czechscript)

---

**Užívejte si programování v češtině! 🇨🇿**

*"Proč psát `function` když můžete psát `funkce`?"*
