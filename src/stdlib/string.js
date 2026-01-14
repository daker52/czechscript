/**
 * CzechScript Standard Library - String Module
 * Pokročilé funkce pro práci s řetězci
 */

const CzechString = {
    // Transformace
    naMalá(text) {
        return text.toLowerCase();
    },
    
    naVelká(text) {
        return text.toUpperCase();
    },
    
    naVelkéPrvníPísmeno(text) {
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    },
    
    naVelkéKaždéSlovo(text) {
        return text.split(' ')
            .map(slovo => this.naVelkéPrvníPísmeno(slovo))
            .join(' ');
    },
    
    // Ořezávání
    ořež(text) {
        return text.trim();
    },
    
    ořežZleva(text) {
        return text.trimStart();
    },
    
    ořežZprava(text) {
        return text.trimEnd();
    },
    
    // Vyhledávání
    obsahuje(text, hledaný) {
        return text.includes(hledaný);
    },
    
    začínáNa(text, prefix) {
        return text.startsWith(prefix);
    },
    
    končíNa(text, suffix) {
        return text.endsWith(suffix);
    },
    
    najdi(text, hledaný) {
        return text.indexOf(hledaný);
    },
    
    najdiPoslední(text, hledaný) {
        return text.lastIndexOf(hledaný);
    },
    
    najdiVšechny(text, hledaný) {
        const pozice = [];
        let index = text.indexOf(hledaný);
        
        while (index !== -1) {
            pozice.push(index);
            index = text.indexOf(hledaný, index + 1);
        }
        
        return pozice;
    },
    
    // Nahrazování
    nahraď(text, co, čím) {
        return text.replace(co, čím);
    },
    
    nahraďVšechny(text, co, čím) {
        return text.replaceAll(co, čím);
    },
    
    nahraďRegex(text, vzor, čím) {
        return text.replace(new RegExp(vzor, 'g'), čím);
    },
    
    // Rozdělování a spojování
    rozděl(text, oddělovač) {
        return text.split(oddělovač);
    },
    
    spoj(pole, oddělovač = '') {
        return pole.join(oddělovač);
    },
    
    // Extrakce
    podřetězec(text, začátek, konec) {
        return text.substring(začátek, konec);
    },
    
    krajní(text, počet) {
        return text.slice(0, počet);
    },
    
    krajníZprava(text, počet) {
        return text.slice(-počet);
    },
    
    // Padding
    doplňZleva(text, délka, znak = ' ') {
        return text.padStart(délka, znak);
    },
    
    doplňZprava(text, délka, znak = ' ') {
        return text.padEnd(délka, znak);
    },
    
    vycentruj(text, délka, znak = ' ') {
        const zbývá = délka - text.length;
        if (zbývá <= 0) return text;
        
        const zleva = Math.floor(zbývá / 2);
        const zprava = zbývá - zleva;
        
        return znak.repeat(zleva) + text + znak.repeat(zprava);
    },
    
    // Opakování
    opakuj(text, počet) {
        return text.repeat(počet);
    },
    
    // Reverzace
    otoč(text) {
        return text.split('').reverse().join('');
    },
    
    // Počítání
    délka(text) {
        return text.length;
    },
    
    počet(text, hledaný) {
        let count = 0;
        let index = 0;
        
        while ((index = text.indexOf(hledaný, index)) !== -1) {
            count++;
            index += hledaný.length;
        }
        
        return count;
    },
    
    početSlov(text) {
        return text.trim().split(/\s+/).filter(s => s.length > 0).length;
    },
    
    početŘádků(text) {
        return text.split('\n').length;
    },
    
    // Porovnávání
    rovnaSe(text1, text2, ignorovatVelikost = false) {
        if (ignorovatVelikost) {
            return text1.toLowerCase() === text2.toLowerCase();
        }
        return text1 === text2;
    },
    
    // Validace
    jePrázdný(text) {
        return text.length === 0;
    },
    
    jePrázdnýNeboMezery(text) {
        return text.trim().length === 0;
    },
    
    jeCelé(text) {
        return /^-?\d+$/.test(text);
    },
    
    jeCíslo(text) {
        return /^-?\d+(\.\d+)?$/.test(text);
    },
    
    jeEmail(text) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text);
    },
    
    jeURL(text) {
        try {
            new URL(text);
            return true;
        } catch {
            return false;
        }
    },
    
    jeIPAdresa(text) {
        return /^(\d{1,3}\.){3}\d{1,3}$/.test(text);
    },
    
    jeHexadecimální(text) {
        return /^[0-9A-Fa-f]+$/.test(text);
    },
    
    // Formátování
    formátujČíslo(číslo, desetinnáMísta = 2, oddělovačTisíců = ' ') {
        const [celá, desetinná] = číslo.toFixed(desetinnáMísta).split('.');
        const celáSOddělovačem = celá.replace(/\B(?=(\d{3})+(?!\d))/g, oddělovačTisíců);
        return desetinná ? `${celáSOddělovačem}.${desetinná}` : celáSOddělovačem;
    },
    
    formátujČas(sekundy) {
        const hodiny = Math.floor(sekundy / 3600);
        const minuty = Math.floor((sekundy % 3600) / 60);
        const sek = Math.floor(sekundy % 60);
        
        return `${String(hodiny).padStart(2, '0')}:${String(minuty).padStart(2, '0')}:${String(sek).padStart(2, '0')}`;
    },
    
    // Sanitizace
    odstraňHTML(text) {
        return text.replace(/<[^>]*>/g, '');
    },
    
    escapujHTML(text) {
        const mapa = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        };
        return text.replace(/[&<>"']/g, m => mapa[m]);
    },
    
    odstraňDiakritiku(text) {
        return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    },
    
    // Slug
    naSlug(text) {
        return text
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    },
    
    // Camel/Snake/Kebab case
    naCamelCase(text) {
        return text
            .toLowerCase()
            .replace(/[^a-záčďéěíňóřšťúůýž0-9]+(.)/gi, (m, chr) => chr.toUpperCase());
    },
    
    naPascalCase(text) {
        const camel = this.naCamelCase(text);
        return camel.charAt(0).toUpperCase() + camel.slice(1);
    },
    
    naSnakeCase(text) {
        return text
            .replace(/([A-Z])/g, '_$1')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/^_+|_+$/g, '');
    },
    
    naKebabCase(text) {
        return text
            .replace(/([A-Z])/g, '-$1')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    },
    
    // Zkracování
    zkrať(text, maxDélka, tečky = '...') {
        if (text.length <= maxDélka) return text;
        return text.slice(0, maxDélka - tečky.length) + tečky;
    },
    
    zkraťSlova(text, maxDélka, tečky = '...') {
        if (text.length <= maxDélka) return text;
        
        const slova = text.split(' ');
        let výsledek = '';
        
        for (const slovo of slova) {
            if ((výsledek + slovo + tečky).length > maxDélka) break;
            výsledek += (výsledek ? ' ' : '') + slovo;
        }
        
        return výsledek + tečky;
    },
    
    // Podobnost
    levenshteinováVzdálenost(a, b) {
        const matrix = [];
        
        for (let i = 0; i <= b.length; i++) {
            matrix[i] = [i];
        }
        
        for (let j = 0; j <= a.length; j++) {
            matrix[0][j] = j;
        }
        
        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        
        return matrix[b.length][a.length];
    },
    
    podobnost(a, b) {
        const vzdálenost = this.levenshteinováVzdálenost(a, b);
        const maxDélka = Math.max(a.length, b.length);
        return 1 - (vzdálenost / maxDélka);
    },
    
    // Random
    náhodnýŘetězec(délka, znaky = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') {
        let výsledek = '';
        for (let i = 0; i < délka; i++) {
            výsledek += znaky.charAt(Math.floor(Math.random() * znaky.length));
        }
        return výsledek;
    },
    
    náhodnéID(délka = 8) {
        return this.náhodnýŘetězec(délka, 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789');
    },
    
    uuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },
    
    // Template
    šablona(šablona, data) {
        return šablona.replace(/\${([^}]+)}/g, (match, klíč) => {
            return data[klíč.trim()] ?? match;
        });
    },
    
    // Diff
    diff(a, b) {
        const změny = [];
        const délka = Math.max(a.length, b.length);
        
        for (let i = 0; i < délka; i++) {
            if (a[i] !== b[i]) {
                změny.push({
                    pozice: i,
                    starý: a[i] || null,
                    nový: b[i] || null
                });
            }
        }
        
        return změny;
    },
    
    // Wrap
    zabalText(text, šířka) {
        const slova = text.split(' ');
        const řádky = [];
        let aktuálníŘádek = '';
        
        for (const slovo of slova) {
            if ((aktuálníŘádek + ' ' + slovo).trim().length <= šířka) {
                aktuálníŘádek += (aktuálníŘádek ? ' ' : '') + slovo;
            } else {
                if (aktuálníŘádek) řádky.push(aktuálníŘádek);
                aktuálníŘádek = slovo;
            }
        }
        
        if (aktuálníŘádek) řádky.push(aktuálníŘádek);
        return řádky.join('\n');
    }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CzechString;
}

if (typeof window !== 'undefined') {
    window.CzechString = CzechString;
    Object.assign(window, CzechString);
}
