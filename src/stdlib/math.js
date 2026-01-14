/**
 * CzechScript Standard Library - Math Module
 * Matematické funkce a konstanty
 */

const CzechMath = {
    // Konstanty
    PI: Math.PI,
    E: Math.E,
    PHI: (1 + Math.sqrt(5)) / 2, // Zlatý řez
    SQRT2: Math.SQRT2,
    SQRT1_2: Math.SQRT1_2,
    LN2: Math.LN2,
    LN10: Math.LN10,
    LOG2E: Math.LOG2E,
    LOG10E: Math.LOG10E,
    
    // Základní operace
    abs(x) {
        return Math.abs(x);
    },
    
    znamenko(x) {
        return Math.sign(x);
    },
    
    // Zaokrouhlování
    zaokrouhli(x, desetinnaMista = 0) {
        const násobitel = Math.pow(10, desetinnaMista);
        return Math.round(x * násobitel) / násobitel;
    },
    
    zaokrouhliNahoru(x) {
        return Math.ceil(x);
    },
    
    zaokrouhliDolů(x) {
        return Math.floor(x);
    },
    
    ořízni(x) {
        return Math.trunc(x);
    },
    
    // Mocniny a odmocniny
    mocnina(základ, exponent) {
        return Math.pow(základ, exponent);
    },
    
    druhaMocnina(x) {
        return x * x;
    },
    
    třetíMocnina(x) {
        return x * x * x;
    },
    
    odmocnina(x) {
        return Math.sqrt(x);
    },
    
    třetíOdmocnina(x) {
        return Math.cbrt(x);
    },
    
    nOdmocnina(x, n) {
        return Math.pow(x, 1 / n);
    },
    
    // Exponenciální a logaritmy
    exp(x) {
        return Math.exp(x);
    },
    
    logaritmus(x, základ = Math.E) {
        if (základ === Math.E) return Math.log(x);
        if (základ === 10) return Math.log10(x);
        if (základ === 2) return Math.log2(x);
        return Math.log(x) / Math.log(základ);
    },
    
    ln(x) {
        return Math.log(x);
    },
    
    log10(x) {
        return Math.log10(x);
    },
    
    log2(x) {
        return Math.log2(x);
    },
    
    // Goniometrické funkce (radiány)
    sin(x) {
        return Math.sin(x);
    },
    
    cos(x) {
        return Math.cos(x);
    },
    
    tan(x) {
        return Math.tan(x);
    },
    
    asin(x) {
        return Math.asin(x);
    },
    
    acos(x) {
        return Math.acos(x);
    },
    
    atan(x) {
        return Math.atan(x);
    },
    
    atan2(y, x) {
        return Math.atan2(y, x);
    },
    
    // Goniometrické funkce (stupně)
    sinStupně(x) {
        return Math.sin(x * Math.PI / 180);
    },
    
    cosStupně(x) {
        return Math.cos(x * Math.PI / 180);
    },
    
    tanStupně(x) {
        return Math.tan(x * Math.PI / 180);
    },
    
    // Hyperbolické funkce
    sinh(x) {
        return Math.sinh(x);
    },
    
    cosh(x) {
        return Math.cosh(x);
    },
    
    tanh(x) {
        return Math.tanh(x);
    },
    
    // Převody
    radiányNaStupně(rad) {
        return rad * 180 / Math.PI;
    },
    
    stupněNaRadiány(deg) {
        return deg * Math.PI / 180;
    },
    
    // Min/Max
    min(...čísla) {
        return Math.min(...čísla);
    },
    
    max(...čísla) {
        return Math.max(...čísla);
    },
    
    omez(hodnota, min, max) {
        return Math.max(min, Math.min(max, hodnota));
    },
    
    // Náhodná čísla
    náhodné() {
        return Math.random();
    },
    
    náhodnéČíslo(min, max) {
        return Math.random() * (max - min) + min;
    },
    
    náhodnéCelé(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    náhodnýPrvek(pole) {
        return pole[Math.floor(Math.random() * pole.length)];
    },
    
    // Statistika
    součet(pole) {
        return pole.reduce((a, b) => a + b, 0);
    },
    
    průměr(pole) {
        return this.součet(pole) / pole.length;
    },
    
    medián(pole) {
        const seřazené = [...pole].sort((a, b) => a - b);
        const střed = Math.floor(seřazené.length / 2);
        
        if (seřazené.length % 2 === 0) {
            return (seřazené[střed - 1] + seřazené[střed]) / 2;
        }
        return seřazené[střed];
    },
    
    modus(pole) {
        const četnosti = {};
        let maxČetnost = 0;
        let modus = pole[0];
        
        pole.forEach(číslo => {
            četnosti[číslo] = (četnosti[číslo] || 0) + 1;
            if (četnosti[číslo] > maxČetnost) {
                maxČetnost = četnosti[číslo];
                modus = číslo;
            }
        });
        
        return modus;
    },
    
    rozptyl(pole) {
        const prům = this.průměr(pole);
        return this.průměr(pole.map(x => Math.pow(x - prům, 2)));
    },
    
    směrodatnáOdchylka(pole) {
        return Math.sqrt(this.rozptyl(pole));
    },
    
    // Kombinatorika
    faktoriál(n) {
        if (n < 0) throw new Error('Faktoriál není definován pro záporná čísla');
        if (n === 0 || n === 1) return 1;
        
        let výsledek = 1;
        for (let i = 2; i <= n; i++) {
            výsledek *= i;
        }
        return výsledek;
    },
    
    kombinace(n, k) {
        if (k > n) return 0;
        return this.faktoriál(n) / (this.faktoriál(k) * this.faktoriál(n - k));
    },
    
    variace(n, k) {
        if (k > n) return 0;
        return this.faktoriál(n) / this.faktoriál(n - k);
    },
    
    permutace(n) {
        return this.faktoriál(n);
    },
    
    // Prvočísla
    jePrvočíslo(n) {
        if (n < 2) return false;
        if (n === 2) return true;
        if (n % 2 === 0) return false;
        
        for (let i = 3; i <= Math.sqrt(n); i += 2) {
            if (n % i === 0) return false;
        }
        return true;
    },
    
    dalšíPrvočíslo(n) {
        let kandidát = n + 1;
        while (!this.jePrvočíslo(kandidát)) {
            kandidát++;
        }
        return kandidát;
    },
    
    prvočíslaDoN(n) {
        const prvočísla = [];
        for (let i = 2; i <= n; i++) {
            if (this.jePrvočíslo(i)) {
                prvočísla.push(i);
            }
        }
        return prvočísla;
    },
    
    // Dělitelnost
    nejd(a, b) {
        // Největší společný dělitel
        while (b !== 0) {
            const temp = b;
            b = a % b;
            a = temp;
        }
        return Math.abs(a);
    },
    
    nejn(a, b) {
        // Nejmenší společný násobek
        return Math.abs(a * b) / this.nejd(a, b);
    },
    
    // Fibonacci
    fibonacci(n) {
        if (n <= 1) return n;
        
        let a = 0, b = 1;
        for (let i = 2; i <= n; i++) {
            [a, b] = [b, a + b];
        }
        return b;
    },
    
    fibonacciPosloupnost(n) {
        const posloupnost = [0, 1];
        for (let i = 2; i < n; i++) {
            posloupnost.push(posloupnost[i - 1] + posloupnost[i - 2]);
        }
        return posloupnost.slice(0, n);
    },
    
    // Geometrie
    obvodKruhu(poloměr) {
        return 2 * Math.PI * poloměr;
    },
    
    obsahKruhu(poloměr) {
        return Math.PI * poloměr * poloměr;
    },
    
    objemKoule(poloměr) {
        return (4 / 3) * Math.PI * Math.pow(poloměr, 3);
    },
    
    povrchKoule(poloměr) {
        return 4 * Math.PI * Math.pow(poloměr, 2);
    },
    
    obsahObdélníku(šířka, výška) {
        return šířka * výška;
    },
    
    obsahTrojúhelníku(základ, výška) {
        return (základ * výška) / 2;
    },
    
    heronůvVzorec(a, b, c) {
        const s = (a + b + c) / 2;
        return Math.sqrt(s * (s - a) * (s - b) * (s - c));
    },
    
    vzdálenost2D(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    },
    
    vzdálenost3D(x1, y1, z1, x2, y2, z2) {
        return Math.sqrt(
            Math.pow(x2 - x1, 2) + 
            Math.pow(y2 - y1, 2) + 
            Math.pow(z2 - z1, 2)
        );
    },
    
    // Interpolace
    lineárníInterpolace(a, b, t) {
        return a + (b - a) * t;
    },
    
    kosinováInterpolace(a, b, t) {
        const t2 = (1 - Math.cos(t * Math.PI)) / 2;
        return a + (b - a) * t2;
    },
    
    // Utility
    jeSudé(n) {
        return n % 2 === 0;
    },
    
    jeLiché(n) {
        return n % 2 !== 0;
    },
    
    jeKladné(n) {
        return n > 0;
    },
    
    jeZáporné(n) {
        return n < 0;
    },
    
    zaměň(pole, i, j) {
        [pole[i], pole[j]] = [pole[j], pole[i]];
        return pole;
    }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CzechMath;
}

if (typeof window !== 'undefined') {
    window.CzechMath = CzechMath;
    Object.assign(window, CzechMath);
}
