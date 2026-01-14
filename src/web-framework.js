/**
 * CzechScript Web Framework
 * Express-like framework v češtině
 */

const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs').promises;
const path = require('path');

class CzechWeb {
    constructor(možnosti = {}) {
        this.možnosti = {
            port: 3000,
            host: 'localhost',
            ...možnosti
        };
        
        this.trasy = {
            GET: new Map(),
            POST: new Map(),
            PUT: new Map(),
            DELETE: new Map(),
            PATCH: new Map()
        };
        
        this.middlewary = [];
        this.errorHandlery = [];
        this.statickéSložky = [];
    }
    
    // Metody pro definici tras
    get(cesta, ...handlery) {
        this.přidejTrasu('GET', cesta, handlery);
        return this;
    }
    
    post(cesta, ...handlery) {
        this.přidejTrasu('POST', cesta, handlery);
        return this;
    }
    
    put(cesta, ...handlery) {
        this.přidejTrasu('PUT', cesta, handlery);
        return this;
    }
    
    delete(cesta, ...handlery) {
        this.přidejTrasu('DELETE', cesta, handlery);
        return this;
    }
    
    patch(cesta, ...handlery) {
        this.přidejTrasu('PATCH', cesta, handlery);
        return this;
    }
    
    // Všechny metody
    všechny(cesta, ...handlery) {
        ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].forEach(metoda => {
            this.přidejTrasu(metoda, cesta, handlery);
        });
        return this;
    }
    
    // Přidání trasy
    přidejTrasu(metoda, cesta, handlery) {
        const vzor = this.vytvořVzor(cesta);
        this.trasy[metoda].set(cesta, { vzor, handlery });
    }
    
    // Vytvoření regex vzoru z cesty
    vytvořVzor(cesta) {
        const parametry = [];
        
        const vzor = cesta.replace(/:([a-záčďéěíňóřšťúůýž]+)/gi, (match, název) => {
            parametry.push(název);
            return '([^/]+)';
        });
        
        return {
            regex: new RegExp('^' + vzor + '$'),
            parametry
        };
    }
    
    // Middleware
    použij(...handlery) {
        if (handlery.length === 1 && typeof handlery[0] === 'function') {
            this.middlewary.push(handlery[0]);
        } else if (handlery.length === 2 && typeof handlery[0] === 'string') {
            this.statickéSložky.push({
                cesta: handlery[0],
                složka: handlery[1]
            });
        }
        return this;
    }
    
    // Error handler
    chyba(handler) {
        this.errorHandlery.push(handler);
        return this;
    }
    
    // Statické soubory
    statické(složka) {
        this.použij('/', složka);
        return this;
    }
    
    // Spuštění serveru
    spusť(port = this.možnosti.port, callback) {
        this.server = http.createServer(async (req, res) => {
            await this.zpracujPožadavek(req, res);
        });
        
        this.server.listen(port, () => {
            console.log(`🚀 CzechWeb server běží na http://localhost:${port}`);
            if (callback) callback();
        });
        
        return this.server;
    }
    
    // Zastavení serveru
    zastaví() {
        if (this.server) {
            this.server.close();
            console.log('🛑 Server zastaven');
        }
    }
    
    // Zpracování požadavku
    async zpracujPožadavek(req, res) {
        const parsovanáURL = url.parse(req.url, true);
        const cesta = parsovanáURL.pathname;
        const metoda = req.method;
        
        // Vytvoř request a response objekty
        const požadavek = await this.vytvořRequest(req, parsovanáURL);
        const odpověď = this.vytvořResponse(res);
        
        try {
            // Spusť middleware
            for (const middleware of this.middlewary) {
                let dalšíZavolán = false;
                const další = () => { dalšíZavolán = true; };
                
                await middleware(požadavek, odpověď, další);
                
                if (!dalšíZavolán) return;
            }
            
            // Kontrola statických souborů
            for (const { cesta: prefix, složka } of this.statickéSložky) {
                if (cesta.startsWith(prefix)) {
                    const souborováCesta = path.join(
                        složka,
                        cesta.slice(prefix.length)
                    );
                    
                    if (await this.odešliStatickýSoubor(souborováCesta, odpověď)) {
                        return;
                    }
                }
            }
            
            // Najdi trasu
            const trasaMapa = this.trasy[metoda];
            let nalezeno = false;
            
            for (const [trasaCesta, { vzor, handlery }] of trasaMapa) {
                const shoda = cesta.match(vzor.regex);
                
                if (shoda) {
                    // Extrahuj parametry
                    požadavek.parametry = {};
                    vzor.parametry.forEach((název, index) => {
                        požadavek.parametry[název] = shoda[index + 1];
                    });
                    
                    // Spusť handlery
                    for (const handler of handlery) {
                        await handler(požadavek, odpověď);
                    }
                    
                    nalezeno = true;
                    break;
                }
            }
            
            if (!nalezeno) {
                odpověď.status(404).odešliJSON({
                    chyba: 'Trasa nenalezena',
                    cesta
                });
            }
            
        } catch (chyba) {
            // Error handling
            if (this.errorHandlery.length > 0) {
                for (const handler of this.errorHandlery) {
                    await handler(chyba, požadavek, odpověď);
                }
            } else {
                console.error('❌ Chyba:', chyba);
                odpověď.status(500).odešliJSON({
                    chyba: 'Interní chyba serveru',
                    zpráva: chyba.message
                });
            }
        }
    }
    
    // Vytvoření request objektu
    async vytvořRequest(req, parsovanáURL) {
        const tělo = await this.načtiTělo(req);
        
        return {
            metoda: req.method,
            url: req.url,
            cesta: parsovanáURL.pathname,
            query: parsovanáURL.query,
            hlavičky: req.headers,
            tělo,
            parametry: {},
            
            json() {
                try {
                    return JSON.parse(tělo);
                } catch {
                    return null;
                }
            },
            
            získej(hlavička) {
                return req.headers[hlavička.toLowerCase()];
            }
        };
    }
    
    // Vytvoření response objektu
    vytvořResponse(res) {
        let statusKód = 200;
        const hlavičky = {};
        
        const odpověď = {
            status(kód) {
                statusKód = kód;
                return odpověď;
            },
            
            nastavHlavičku(klíč, hodnota) {
                hlavičky[klíč] = hodnota;
                return odpověď;
            },
            
            typ(contentType) {
                hlavičky['Content-Type'] = contentType;
                return odpověď;
            },
            
            odešli(data) {
                res.writeHead(statusKód, hlavičky);
                res.end(data);
            },
            
            odešliJSON(data) {
                odpověď.typ('application/json; charset=utf-8');
                odpověď.odešli(JSON.stringify(data, null, 2));
            },
            
            odešliHTML(html) {
                odpověď.typ('text/html; charset=utf-8');
                odpověď.odešli(html);
            },
            
            odešliText(text) {
                odpověď.typ('text/plain; charset=utf-8');
                odpověď.odešli(text);
            },
            
            přesměruj(url, permanentně = false) {
                odpověď.status(permanentně ? 301 : 302);
                odpověď.nastavHlavičku('Location', url);
                odpověď.odešli('');
            },
            
            nastavCookie(název, hodnota, možnosti = {}) {
                const {
                    maxAge,
                    expires,
                    path = '/',
                    domain,
                    secure = false,
                    httpOnly = true,
                    sameSite = 'Lax'
                } = možnosti;
                
                let cookie = `${název}=${hodnota}`;
                
                if (maxAge) cookie += `; Max-Age=${maxAge}`;
                if (expires) cookie += `; Expires=${expires.toUTCString()}`;
                cookie += `; Path=${path}`;
                if (domain) cookie += `; Domain=${domain}`;
                if (secure) cookie += '; Secure';
                if (httpOnly) cookie += '; HttpOnly';
                if (sameSite) cookie += `; SameSite=${sameSite}`;
                
                const stávajícíCookies = hlavičky['Set-Cookie'] || [];
                hlavičky['Set-Cookie'] = Array.isArray(stávajícíCookies)
                    ? [...stávajícíCookies, cookie]
                    : [stávajícíCookies, cookie];
                
                return odpověď;
            },
            
            vymažCookie(název) {
                odpověď.nastavCookie(název, '', {
                    maxAge: 0,
                    expires: new Date(0)
                });
                return odpověď;
            }
        };
        
        return odpověď;
    }
    
    // Načtení těla požadavku
    načtiTělo(req) {
        return new Promise((resolve) => {
            let tělo = '';
            
            req.on('data', chunk => {
                tělo += chunk.toString();
            });
            
            req.on('end', () => {
                resolve(tělo);
            });
        });
    }
    
    // Odeslání statického souboru
    async odešliStatickýSoubor(cesta, odpověď) {
        try {
            const stats = await fs.stat(cesta);
            
            if (!stats.isFile()) return false;
            
            const obsah = await fs.readFile(cesta);
            const přípona = path.extname(cesta).toLowerCase();
            
            const mimeTypy = {
                '.html': 'text/html',
                '.css': 'text/css',
                '.js': 'application/javascript',
                '.json': 'application/json',
                '.png': 'image/png',
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.gif': 'image/gif',
                '.svg': 'image/svg+xml',
                '.ico': 'image/x-icon',
                '.pdf': 'application/pdf',
                '.txt': 'text/plain'
            };
            
            const mimeType = mimeTypy[přípona] || 'application/octet-stream';
            
            odpověď.typ(mimeType);
            odpověď.odešli(obsah);
            
            return true;
        } catch {
            return false;
        }
    }
}

// Helper funkce pro vytvoření aplikace
function vytvořAplikaci(možnosti) {
    return new CzechWeb(možnosti);
}

// Middleware helpers
const middleware = {
    // Logger
    logger() {
        return (req, res, další) => {
            const začátek = Date.now();
            
            res.on('finish', () => {
                const trvání = Date.now() - začátek;
                console.log(`${req.metoda} ${req.cesta} - ${res.statusCode} (${trvání}ms)`);
            });
            
            další();
        };
    },
    
    // CORS
    cors(možnosti = {}) {
        const {
            origin = '*',
            methods = 'GET,HEAD,PUT,PATCH,POST,DELETE',
            allowedHeaders = 'Content-Type,Authorization'
        } = možnosti;
        
        return (req, res, další) => {
            res.nastavHlavičku('Access-Control-Allow-Origin', origin);
            res.nastavHlavičku('Access-Control-Allow-Methods', methods);
            res.nastavHlavičku('Access-Control-Allow-Headers', allowedHeaders);
            
            if (req.metoda === 'OPTIONS') {
                res.status(200).odešli('');
            } else {
                další();
            }
        };
    },
    
    // JSON parser
    json() {
        return (req, res, další) => {
            if (req.hlavičky['content-type']?.includes('application/json')) {
                try {
                    req.data = req.json();
                } catch (err) {
                    return res.status(400).odešliJSON({
                        chyba: 'Neplatný JSON'
                    });
                }
            }
            další();
        };
    }
};

module.exports = {
    CzechWeb,
    vytvořAplikaci,
    middleware
};
