/**
 * CzechScript Standard Library - HTTP Module
 * Pokročilé HTTP funkce pro fetch a server
 */

const CzechHTTP = {
    // Fetch API (browser + Node.js 18+)
    async načti(url, možnosti = {}) {
        const response = await fetch(url, možnosti);
        
        return {
            ok: response.ok,
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries()),
            
            async text() {
                return await response.text();
            },
            
            async json() {
                return await response.json();
            },
            
            async blob() {
                return await response.blob();
            },
            
            async arrayBuffer() {
                return await response.arrayBuffer();
            }
        };
    },
    
    async get(url, hlavičky = {}) {
        return this.načti(url, {
            method: 'GET',
            headers: hlavičky
        });
    },
    
    async post(url, data, hlavičky = {}) {
        const hlavičkyJSON = {
            'Content-Type': 'application/json',
            ...hlavičky
        };
        
        return this.načti(url, {
            method: 'POST',
            headers: hlavičkyJSON,
            body: JSON.stringify(data)
        });
    },
    
    async put(url, data, hlavičky = {}) {
        const hlavičkyJSON = {
            'Content-Type': 'application/json',
            ...hlavičky
        };
        
        return this.načti(url, {
            method: 'PUT',
            headers: hlavičkyJSON,
            body: JSON.stringify(data)
        });
    },
    
    async delete(url, hlavičky = {}) {
        return this.načti(url, {
            method: 'DELETE',
            headers: hlavičky
        });
    },
    
    async patch(url, data, hlavičky = {}) {
        const hlavičkyJSON = {
            'Content-Type': 'application/json',
            ...hlavičky
        };
        
        return this.načti(url, {
            method: 'PATCH',
            headers: hlavičkyJSON,
            body: JSON.stringify(data)
        });
    },
    
    // Formuláře
    async odesliFormulář(url, data, hlavičky = {}) {
        const formData = new FormData();
        
        for (const [klíč, hodnota] of Object.entries(data)) {
            formData.append(klíč, hodnota);
        }
        
        return this.načti(url, {
            method: 'POST',
            headers: hlavičky,
            body: formData
        });
    },
    
    // Query parametry
    vytvořQuery(parametry) {
        return new URLSearchParams(parametry).toString();
    },
    
    přidejQuery(url, parametry) {
        const queryString = this.vytvořQuery(parametry);
        const oddělovač = url.includes('?') ? '&' : '?';
        return url + oddělovač + queryString;
    },
    
    parsujQuery(queryString) {
        const params = new URLSearchParams(queryString);
        const výsledek = {};
        
        for (const [klíč, hodnota] of params.entries()) {
            výsledek[klíč] = hodnota;
        }
        
        return výsledek;
    },
    
    // URL manipulace
    parsujURL(url) {
        const parsed = new URL(url);
        
        return {
            protokol: parsed.protocol,
            host: parsed.host,
            hostname: parsed.hostname,
            port: parsed.port,
            cesta: parsed.pathname,
            query: this.parsujQuery(parsed.search.slice(1)),
            hash: parsed.hash,
            původ: parsed.origin
        };
    },
    
    // Retry logic
    async načtiSOpakováním(url, možnosti = {}, maxPokusů = 3, prodleva = 1000) {
        let poslednícError;
        
        for (let pokus = 1; pokus <= maxPokusů; pokus++) {
            try {
                return await this.načti(url, možnosti);
            } catch (err) {
                poslednícError = err;
                
                if (pokus < maxPokusů) {
                    await new Promise(resolve => setTimeout(resolve, prodleva * pokus));
                }
            }
        }
        
        throw poslednícError;
    },
    
    // Timeout
    async načtiSTimeoutem(url, možnosti = {}, timeout = 5000) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        try {
            const response = await this.načti(url, {
                ...možnosti,
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            return response;
        } catch (err) {
            clearTimeout(timeoutId);
            throw err;
        }
    },
    
    // Cache helper
    vytvořCache() {
        const cache = new Map();
        
        return {
            async načti(url, možnosti = {}, ttl = 60000) {
                const klíč = url + JSON.stringify(možnosti);
                const cached = cache.get(klíč);
                
                if (cached && Date.now() - cached.čas < ttl) {
                    return cached.data;
                }
                
                const data = await CzechHTTP.načti(url, možnosti);
                cache.set(klíč, { data, čas: Date.now() });
                
                return data;
            },
            
            vymaž(url = null) {
                if (url) {
                    const klíč = url;
                    cache.delete(klíč);
                } else {
                    cache.clear();
                }
            },
            
            velikost() {
                return cache.size;
            }
        };
    },
    
    // HTTP Server (Node.js only)
    vytvořServer(handler) {
        if (typeof require === 'undefined') {
            throw new Error('Server lze vytvořit pouze v Node.js prostředí');
        }
        
        const http = require('http');
        
        const server = http.createServer(async (req, res) => {
            // Parse request body
            let tělo = '';
            req.on('data', chunk => {
                tělo += chunk.toString();
            });
            
            req.on('end', async () => {
                const request = {
                    metoda: req.method,
                    url: req.url,
                    hlavičky: req.headers,
                    tělo,
                    
                    json() {
                        try {
                            return JSON.parse(tělo);
                        } catch {
                            return null;
                        }
                    },
                    
                    query() {
                        const url = new URL(req.url, `http://${req.headers.host}`);
                        return CzechHTTP.parsujQuery(url.search.slice(1));
                    }
                };
                
                const response = {
                    status: 200,
                    hlavičky: {},
                    
                    nastavStatus(kód) {
                        this.status = kód;
                        return this;
                    },
                    
                    nastavHlavičku(klíč, hodnota) {
                        this.hlavičky[klíč] = hodnota;
                        return this;
                    },
                    
                    odešli(data) {
                        res.writeHead(this.status, this.hlavičky);
                        res.end(data);
                    },
                    
                    odešliJSON(data) {
                        this.nastavHlavičku('Content-Type', 'application/json');
                        this.odešli(JSON.stringify(data));
                    },
                    
                    odešliHTML(html) {
                        this.nastavHlavičku('Content-Type', 'text/html; charset=utf-8');
                        this.odešli(html);
                    },
                    
                    přesměruj(url, permanentně = false) {
                        this.nastavStatus(permanentně ? 301 : 302);
                        this.nastavHlavičku('Location', url);
                        this.odešli('');
                    }
                };
                
                try {
                    await handler(request, response);
                } catch (err) {
                    response.nastavStatus(500);
                    response.odešliJSON({
                        chyba: 'Interní chyba serveru',
                        zpráva: err.message
                    });
                }
            });
        });
        
        return {
            spusť(port, callback) {
                server.listen(port, () => {
                    if (callback) callback(port);
                });
            },
            
            zastaví() {
                server.close();
            }
        };
    },
    
    // WebSocket helper (browser)
    vytvořWebSocket(url, protokoly = []) {
        if (typeof WebSocket === 'undefined') {
            throw new Error('WebSocket není podporován v tomto prostředí');
        }
        
        const ws = new WebSocket(url, protokoly);
        const události = new Map();
        
        ws.onopen = () => {
            if (události.has('otevřeno')) {
                události.get('otevřeno')();
            }
        };
        
        ws.onmessage = (event) => {
            if (události.has('zpráva')) {
                události.get('zpráva')(event.data);
            }
        };
        
        ws.onerror = (error) => {
            if (události.has('chyba')) {
                události.get('chyba')(error);
            }
        };
        
        ws.onclose = () => {
            if (události.has('zavřeno')) {
                události.get('zavřeno')();
            }
        };
        
        return {
            odešli(data) {
                if (typeof data === 'object') {
                    ws.send(JSON.stringify(data));
                } else {
                    ws.send(data);
                }
            },
            
            zavři() {
                ws.close();
            },
            
            na(událost, handler) {
                události.set(událost, handler);
            },
            
            stav() {
                const stavy = ['PŘIPOJOVÁNÍ', 'OTEVŘENO', 'ZAVÍRÁNÍ', 'ZAVŘENO'];
                return stavy[ws.readyState];
            }
        };
    }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CzechHTTP;
}

if (typeof window !== 'undefined') {
    window.CzechHTTP = CzechHTTP;
    Object.assign(window, CzechHTTP);
}
