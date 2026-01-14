# 🎨 VSCode Extension pro CzechScript - Průvodce instalací

## 📦 Vytvořené soubory

VSCode rozšíření se nachází ve složce `czechscript-vscode/` a obsahuje:

### Základní struktura
```
czechscript-vscode/
├── package.json              # Manifest rozšíření
├── tsconfig.json            # TypeScript konfigurace
├── README.md                # Dokumentace
├── .gitignore              # Git ignore
├── .vscodeignore           # VSCode ignore
│
├── src/
│   └── extension.ts        # Hlavní kód rozšíření
│
├── syntaxes/
│   └── czechscript.tmLanguage.json    # Syntax highlighting
│
├── snippets/
│   └── czechscript.json    # 40+ snippetů
│
├── images/
│   ├── icon.png           # Ikona rozšíření (128x128)
│   └── file-icon.svg      # Ikona pro .cs soubory
│
└── language-configuration.json    # Brackets, auto-close...
```

## 🚀 Jak nainstalovat rozšíření

### Varianta 1: Lokální vývoj (doporučeno pro testování)

1. **Přesuňte složku do správného místa:**
   ```powershell
   # Zkopírujte czechscript-vscode do nového umístění
   Copy-Item -Recurse "czechscript-vscode" "C:\Users\hak\Documents\czechscript-vscode"
   cd C:\Users\hak\Documents\czechscript-vscode
   ```

2. **Nainstalujte závislosti:**
   ```powershell
   npm install
   ```

3. **Zkompilujte TypeScript:**
   ```powershell
   npm run compile
   ```

4. **Otevřete ve VSCode:**
   ```powershell
   code .
   ```

5. **Spusťte rozšíření:**
   - Stiskněte `F5` pro spuštění v Debug módu
   - Otevře se nové VSCode okno s aktivním rozšířením
   - Vytvořte testovací `.cs` soubor

### Varianta 2: Instalace jako VSIX balíček

1. **Nainstalujte VSCE (VSCode Extension Manager):**
   ```powershell
   npm install -g vsce
   ```

2. **Vytvořte VSIX balíček:**
   ```powershell
   cd czechscript-vscode
   npm install
   npm run compile
   vsce package
   ```
   Vytvoří soubor `czechscript-1.0.0.vsix`

3. **Nainstalujte do VSCode:**
   ```powershell
   code --install-extension czechscript-1.0.0.vsix
   ```
   
   Nebo přes GUI:
   - VSCode → Extensions (`Ctrl+Shift+X`)
   - Klikněte na `...` (More Actions)
   - "Install from VSIX..."
   - Vyberte `czechscript-1.0.0.vsix`

4. **Restartujte VSCode**

### Varianta 3: Publikace na Marketplace (veřejné použití)

1. **Vytvořte účet na Visual Studio Marketplace:**
   - Jděte na https://marketplace.visualstudio.com/manage
   - Vytvořte Personal Access Token

2. **Login přes VSCE:**
   ```powershell
   vsce login daker52
   ```

3. **Publikujte:**
   ```powershell
   vsce publish
   ```

4. **Instalace uživateli:**
   - VSCode → Extensions
   - Vyhledejte "CzechScript"
   - Klikněte Install

## ✨ Funkce rozšíření

### 🎨 Syntax Highlighting
Automaticky zvýrazňuje:
- **Klíčová slova**: `proměnná`, `funkce`, `třída`, `když`, `dokud`...
- **Typy**: `číslo`, `řetězec`, `boolean`, `pole`...
- **Operátory**: `a`, `nebo`, `ne`, `rovno`, `větší`...
- **Konstanty**: `pravda`, `nepravda`, `null`
- **Komentáře**: `//` a `/* */`
- **Řetězce**: `"text"`, `'text'`, `` `template` ``

### 📝 Snippety (40+)

Zkratky pro rychlé psaní:

| Zkratka | Výsledek |
|---------|----------|
| `pro` | `proměnná název = hodnota;` |
| `funkce` | Celá funkce s parametry |
| `třída` | Celá třída s konstruktorem |
| `když` | If podmínka |
| `dokud` | While cyklus |
| `pro-každý` | For-each cyklus |
| `zkus` | Try-catch blok |
| `fetch-get` | GET request s error handlingem |

### ⌨️ Příkazy

- `Ctrl+Shift+B` - **Zkompilovat** soubor
- `Ctrl+Shift+R` - **Spustit** soubor
- `Ctrl+Space` - **IntelliSense** návrhy
- `Tab` - **Rozbalit** snippet

### ⚙️ Konfigurace

Nastavte v `settings.json`:

```json
{
  "czechscript.compiler.path": "node czechscript/src/cli.js",
  "czechscript.compiler.optimize": true,
  "czechscript.compiler.strict": false
}
```

## 🧪 Testování rozšíření

1. **Vytvořte testovací soubor `test.cs`:**
   ```czechscript
   funkce pozdrav(jméno) {
       vrať "Ahoj, " + jméno + "!";
   }
   
   vypis(pozdrav("světe"));
   ```

2. **Zkontrolujte syntax highlighting:**
   - Klíčová slova jsou modrá
   - Řetězce jsou oranžové
   - Komentáře jsou zelené

3. **Vyzkoušejte snippety:**
   - Napište `pro` a stiskněte `Tab`
   - Mělo by se rozbalit `proměnná název = hodnota;`

4. **Zkompilujte:**
   - Stiskněte `Ctrl+Shift+B`
   - V Output panelu uvidíte výsledek

## 🐛 Řešení problémů

### Rozšíření se neaktivuje
- Zkontrolujte, že soubor má příponu `.cs`
- Restartujte VSCode

### Kompilace nefunguje
- Nastavte správnou cestu k compileru v settings
- Zkontrolujte, že czechscript je nainstalován

### Snippety nefungují
- Zkontrolujte language mode (mělo by být "CzechScript")
- Stiskněte `Ctrl+Space` pro manuální aktivaci

### Syntax highlighting chybí
- Zkontrolujte, že `syntaxes/czechscript.tmLanguage.json` existuje
- Restartujte VSCode

## 📚 Další kroky

### Vylepšení rozšíření:

1. **IntelliSense:**
   - Přidejte completion provider pro funkce z runtime
   - Hover tooltips s dokumentací

2. **Debugger:**
   - Debug adapter pro krokování kódu
   - Breakpoints v CzechScript

3. **Formátování:**
   - Prettier plugin pro CzechScript
   - Auto-formátování na save

4. **REPL:**
   - Interaktivní konzole v Terminal
   - Vyhodnocování výrazů

5. **Ikony:**
   - Vytvořte profesionální 128x128 PNG ikonu
   - Favicon pro webové stránky

## 🎓 Užitečné zdroje

- [VSCode Extension API](https://code.visualstudio.com/api)
- [TextMate Grammar](https://macromates.com/manual/en/language_grammars)
- [Extension Samples](https://github.com/microsoft/vscode-extension-samples)
- [Publishing Extensions](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)

## 🤝 Podpora

Máte problémy? Otevřete issue:
- GitHub: https://github.com/daker52/czechscript-vscode/issues

---

**Šťastné programování v češtině! 🇨🇿**
