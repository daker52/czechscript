// Ukázka základní syntaxe CzechScript

// ========== PROMĚNNÉ ==========
proměnná jméno = "Ondřej"
proměnná věk = 25
konstanta PI = 3.14159

vypis("Jméno:", jméno)
vypis("Věk:", věk)

// ========== PODMÍNKY ==========
když (věk >= 18) {
    pak vypis("Jsi dospělý")
} jinak {
    vypis("Jsi nezletilý")
}

// Ternární operátor
proměnná status = (věk >= 18) ? "dospělý" : "nezletilý"

// ========== SMYČKY ==========

// For smyčka
opakuj (5) {
    vypis("Iterace")
}

// While smyčka
proměnná i = 0
dokud (i < 5) {
    vypis("i =", i)
    i = i + 1
}

// For...of smyčka
proměnná seznam = [1, 2, 3, 4, 5]
pro_každý (číslo v seznam) {
    vypis("Číslo:", číslo)
}

// ========== FUNKCE ==========
funkce pozdrav(jméno) {
    vrať "Ahoj, " + jméno + "!"
}

funkce součet(a, b) {
    vrať a + b
}

vypis(pozdrav("Ondřej"))
vypis("5 + 3 =", součet(5, 3))

// Arrow funkce
konstanta násobek = (x, y) => x * y
vypis("4 * 6 =", násobek(4, 6))

// ========== OBJEKTY ==========
proměnná osoba = {
    jméno: "Jan",
    věk: 30,
    povolání: "programátor",
    
    představSe: funkce() {
        vrať "Ahoj, jsem " + tento.jméno
    }
}

vypis(osoba.představSe())

// ========== TŘÍDY ==========
třída Auto {
    konstruktor(značka, model, rok) {
        tento.značka = značka
        tento.model = model
        tento.rok = rok
    }
    
    info() {
        vrať tento.značka + " " + tento.model + " (" + tento.rok + ")"
    }
    
    jeStaré() {
        konstanta aktuálníRok = 2026
        vrať (aktuálníRok - tento.rok) > 10
    }
}

proměnná auto1 = nový Auto("Škoda", "Octavia", 2020)
vypis(auto1.info())
vypis("Je staré?", auto1.jeStaré())

// ========== POLE A METODY ==========
proměnná čísla = [1, 2, 3, 4, 5]

// Map
proměnná dvojnásobky = čísla.map(x => x * 2)
vypis("Dvojnásobky:", dvojnásobky)

// Filter
proměnná sudá = čísla.filter(x => x % 2 === 0)
vypis("Sudá čísla:", sudá)

// Reduce
proměnná suma = čísla.reduce((acc, val) => acc + val, 0)
vypis("Suma:", suma)

// ========== PRÁCE S ŘETĚZCI ==========
proměnná text = "CzechScript"
vypis("Délka:", text.length)
vypis("Velká písmena:", text.toUpperCase())
vypis("Obsahuje 'Script':", text.includes("Script"))

// Template strings
proměnná message = `Ahoj ${jméno}, je ti ${věk} let`
vypis(message)

// ========== ASYNCHRONNÍ KÓD ==========
async funkce načtiData(url) {
    zkus {
        proměnná odpověď = await načti_data(url)
        proměnná data = await odpověď.json()
        vrať data
    } chyť (chyba) {
        vypis("Chyba při načítání:", chyba)
    } nakonec {
        vypis("Načítání dokončeno")
    }
}

// ========== DESTRUKTURACE ==========
proměnná [první, druhý, ...zbytek] = [1, 2, 3, 4, 5]
vypis("První:", první, "Druhý:", druhý, "Zbytek:", zbytek)

proměnná {jméno: userName, věk: userAge} = osoba
vypis("Uživatel:", userName, userAge)

// ========== SPREAD OPERÁTOR ==========
proměnná pole1 = [1, 2, 3]
proměnná pole2 = [4, 5, 6]
proměnná spojené = [...pole1, ...pole2]
vypis("Spojené:", spojené)

// ========== LOGICKÉ OPERÁTORY ==========
když (věk >= 18 a věk < 65) {
    pak vypis("Pracující věk")
}

když (věk < 18 nebo věk > 65) {
    pak vypis("Mimo pracující věk")
}

když (ne (věk < 0)) {
    pak vypis("Platný věk")
}

// ========== POROVNÁNÍ ==========
když (jméno rovno "Ondřej") {
    pak vypis("Ahoj Ondřeji!")
}

když (věk větší_rovno 18) {
    pak vypis("Můžeš volit")
}

// ========== MODULY ==========
exportuj {
    pozdrav,
    součet,
    Auto
}

// Defaultní export
exportuj default třída CzechScriptApp {
    konstruktor() {
        vypis("Aplikace spuštěna")
    }
}
