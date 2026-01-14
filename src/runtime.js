/**
 * CzechScript Runtime Library
 * Standardní knihovna s funkcemi pro CzechScript
 */

const CzechScriptRuntime = {
    // ==== Výpis ====
    
    vypis(...args) {
        console.log(...args);
    },
    
    vypisChybu(...args) {
        console.error(...args);
    },
    
    vypisVarování(...args) {
        console.warn(...args);
    },
    
    // ==== DOM Manipulace ====
    
    prvek(selektor) {
        return document.querySelector(selektor);
    },
    
    prvky(selektor) {
        return Array.from(document.querySelectorAll(selektor));
    },
    
    vytvoř(tag) {
        return document.createElement(tag);
    },
    
    odstraň(element) {
        if (typeof element === 'string') {
            element = this.prvek(element);
        }
        element?.remove();
    },
    
    přidejTřídu(element, třída) {
        if (typeof element === 'string') {
            element = this.prvek(element);
        }
        element?.classList.add(třída);
    },
    
    odeberTřídu(element, třída) {
        if (typeof element === 'string') {
            element = this.prvek(element);
        }
        element?.classList.remove(třída);
    },
    
    přepniTřídu(element, třída) {
        if (typeof element === 'string') {
            element = this.prvek(element);
        }
        element?.classList.toggle(třída);
    },
    
    nastavStyl(element, vlastnost, hodnota) {
        if (typeof element === 'string') {
            element = this.prvek(element);
        }
        if (element) {
            element.style[vlastnost] = hodnota;
        }
    },
    
    nastavAtribut(element, atribut, hodnota) {
        if (typeof element === 'string') {
            element = this.prvek(element);
        }
        element?.setAttribute(atribut, hodnota);
    },
    
    získejAtribut(element, atribut) {
        if (typeof element === 'string') {
            element = this.prvek(element);
        }
        return element?.getAttribute(atribut);
    },
    
    // ==== Events ====
    
    poKliknutí(element, callback) {
        if (typeof element === 'string') {
            element = this.prvek(element);
        }
        element?.addEventListener('click', callback);
    },
    
    poNačtení(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    },
    
    // ==== HTTP Requesty ====
    
    async načtiData(url, možnosti = {}) {
        try {
            const response = await fetch(url, možnosti);
            if (!response.ok) {
                throw new Error(`HTTP chyba! Status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            this.vypisChybu('Chyba při načítání dat:', error);
            throw error;
        }
    },
    
    async odesliData(url, data, metoda = 'POST') {
        try {
            const response = await fetch(url, {
                method: metoda,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP chyba! Status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            this.vypisChybu('Chyba při odesílání dat:', error);
            throw error;
        }
    },
    
    // ==== Local Storage ====
    
    ulož(klíč, hodnota) {
        try {
            const json = JSON.stringify(hodnota);
            localStorage.setItem(klíč, json);
        } catch (error) {
            this.vypisChybu('Chyba při ukládání:', error);
        }
    },
    
    načti(klíč, výchozí = null) {
        try {
            const json = localStorage.getItem(klíč);
            return json ? JSON.parse(json) : výchozí;
        } catch (error) {
            this.vypisChybu('Chyba při načítání:', error);
            return výchozí;
        }
    },
    
    smaž(klíč) {
        localStorage.removeItem(klíč);
    },
    
    smažVše() {
        localStorage.clear();
    },
    
    // ==== Pole ====
    
    délka(pole) {
        return Array.isArray(pole) ? pole.length : 0;
    },
    
    přidej(pole, ...položky) {
        pole.push(...položky);
        return pole;
    },
    
    odeber(pole, index) {
        return pole.splice(index, 1)[0];
    },
    
    najdi(pole, callback) {
        return pole.find(callback);
    },
    
    filtruj(pole, callback) {
        return pole.filter(callback);
    },
    
    mapuj(pole, callback) {
        return pole.map(callback);
    },
    
    seřaď(pole, callback) {
        return pole.sort(callback);
    },
    
    obsahuje(pole, položka) {
        return pole.includes(položka);
    },
    
    // ==== Řetězce ====
    
    délkaŘetězce(řetězec) {
        return řetězec.length;
    },
    
    velkáPísmena(řetězec) {
        return řetězec.toUpperCase();
    },
    
    malápísmena(řetězec) {
        return řetězec.toLowerCase();
    },
    
    rozdělŘetězec(řetězec, oddělovač) {
        return řetězec.split(oddělovač);
    },
    
    spojŘetězce(pole, oddělovač = '') {
        return pole.join(oddělovač);
    },
    
    nahraď(řetězec, hledej, nahraď) {
        return řetězec.replace(hledej, nahraď);
    },
    
    začínáNa(řetězec, prefix) {
        return řetězec.startsWith(prefix);
    },
    
    končíNa(řetězec, suffix) {
        return řetězec.endsWith(suffix);
    },
    
    // ==== Čísla ====
    
    náhodnéČíslo(min = 0, max = 1) {
        return Math.random() * (max - min) + min;
    },
    
    náhodnéCeléČíslo(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    zaokrouhli(číslo) {
        return Math.round(číslo);
    },
    
    zaokrouhliNahoru(číslo) {
        return Math.ceil(číslo);
    },
    
    zaokrouhliDolů(číslo) {
        return Math.floor(číslo);
    },
    
    absolutníHodnota(číslo) {
        return Math.abs(číslo);
    },
    
    mocnina(základ, exponent) {
        return Math.pow(základ, exponent);
    },
    
    odmocnina(číslo) {
        return Math.sqrt(číslo);
    },
    
    // ==== Čas ====
    
    čekej(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },
    
    nastavČasovač(callback, ms) {
        return setTimeout(callback, ms);
    },
    
    nastavInterval(callback, ms) {
        return setInterval(callback, ms);
    },
    
    zrušČasovač(id) {
        clearTimeout(id);
    },
    
    zrušInterval(id) {
        clearInterval(id);
    },
    
    získejČas() {
        return Date.now();
    },
    
    získejDatum() {
        return new Date();
    },
    
    // ==== Objekty ====
    
    klíče(objekt) {
        return Object.keys(objekt);
    },
    
    hodnoty(objekt) {
        return Object.values(objekt);
    },
    
    položky(objekt) {
        return Object.entries(objekt);
    },
    
    slouč(...objekty) {
        return Object.assign({}, ...objekty);
    },
    
    zkopíruj(objekt) {
        return JSON.parse(JSON.stringify(objekt));
    },
    
    // ==== Utility ====
    
    jePrázdné(hodnota) {
        if (hodnota === null || hodnota === undefined) return true;
        if (typeof hodnota === 'string') return hodnota.length === 0;
        if (Array.isArray(hodnota)) return hodnota.length === 0;
        if (typeof hodnota === 'object') return Object.keys(hodnota).length === 0;
        return false;
    },
    
    typHodnoty(hodnota) {
        if (hodnota === null) return 'null';
        if (Array.isArray(hodnota)) return 'pole';
        return typeof hodnota;
    },
    
    převeďNaJSON(hodnota) {
        return JSON.stringify(hodnota);
    },
    
    převeďZJSON(json) {
        return JSON.parse(json);
    }
};

// Export pro Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CzechScriptRuntime;
}

// Global pro prohlížeč
if (typeof window !== 'undefined') {
    window.CzechScript = CzechScriptRuntime;
    
    // Automaticky přidej do global scope
    Object.assign(window, CzechScriptRuntime);
}
