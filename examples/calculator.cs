// Jednoduchý příklad - Kalkulačka

třída Kalkulačka {
    konstruktor() {
        tento.výsledek = 0;
        tento.inicializuj();
    }
    
    inicializuj() {
        poNačtení(() => {
            vypis("Kalkulačka načtena!");
            
            // Tlačítka číslic
            proměnná tlačítkaČísel = prvky(".číslo");
            pro_každý (tlačítko v tlačítkaČísel) {
                poKliknutí(tlačítko, () => {
                    proměnná číslo = získejAtribut(tlačítko, "data-číslo");
                    tento.přidejČíslo(číslo);
                });
            }
            
            // Tlačítka operací
            poKliknutí("#plus", () => tento.operace("+"));
            poKliknutí("#mínus", () => tento.operace("-"));
            poKliknutí("#krát", () => tento.operace("*"));
            poKliknutí("#děleno", () => tento.operace("/"));
            poKliknutí("#rovná-se", () => tento.spočítej());
            poKliknutí("#vymaž", () => tento.vymaž());
        });
    }
    
    přidejČíslo(číslo) {
        proměnná displej = prvek("#displej");
        když (displej.textContent rovno "0") {
            displej.textContent = číslo;
        } jinak {
            displej.textContent += číslo;
        }
    }
    
    operace(op) {
        proměnná displej = prvek("#displej");
        tento.výsledek = parseFloat(displej.textContent);
        tento.operátor = op;
        displej.textContent = "0";
    }
    
    spočítej() {
        proměnná displej = prvek("#displej");
        proměnná aktuální = parseFloat(displej.textContent);
        
        když (tento.operátor rovno "+") {
            tento.výsledek = tento.výsledek + aktuální;
        } jinak když (tento.operátor rovno "-") {
            tento.výsledek = tento.výsledek - aktuální;
        } jinak když (tento.operátor rovno "*") {
            tento.výsledek = tento.výsledek * aktuální;
        } jinak když (tento.operátor rovno "/") {
            když (aktuální nerovno 0) {
                tento.výsledek = tento.výsledek / aktuální;
            } jinak {
                vypisChybu("Nelze dělit nulou!");
                vrať;
            }
        }
        
        displej.textContent = tento.výsledek;
    }
    
    vymaž() {
        tento.výsledek = 0;
        tento.operátor = null;
        prvek("#displej").textContent = "0";
    }
}

// Spuštění
proměnná kalkulačka = nový Kalkulačka();
