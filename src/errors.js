/**
 * CzechScript Error Reporting
 * České chybové hlášky a pokročilá diagnostika
 */

class CzechScriptError extends Error {
    constructor(message, type, location, suggestion) {
        super(message);
        this.name = 'CzechScriptError';
        this.type = type;
        this.location = location; // { line, column, file }
        this.suggestion = suggestion;
    }
    
    format(sourceCode) {
        const lines = sourceCode.split('\n');
        const { line, column, file } = this.location;
        
        let output = '\n';
        output += '╔════════════════════════════════════════════════════════════╗\n';
        output += `║  ❌ ${this.type}\n`;
        output += '╚════════════════════════════════════════════════════════════╝\n\n';
        
        if (file) {
            output += `📄 Soubor: ${file}\n`;
        }
        
        output += `📍 Řádek ${line}, Sloupec ${column}\n\n`;
        output += `💬 ${this.message}\n\n`;
        
        // Show code context (3 lines before, current line, 3 lines after)
        const startLine = Math.max(0, line - 4);
        const endLine = Math.min(lines.length, line + 3);
        
        output += '┌─ Kontext:\n';
        
        for (let i = startLine; i < endLine; i++) {
            const lineNum = i + 1;
            const isErrorLine = lineNum === line;
            const prefix = isErrorLine ? '→' : ' ';
            const lineNumStr = String(lineNum).padStart(4, ' ');
            
            output += `${prefix} ${lineNumStr} │ ${lines[i]}\n`;
            
            if (isErrorLine && column > 0) {
                const spaces = ' '.repeat(column + 8);
                output += `  ${spaces}^\n`;
                output += `  ${spaces}└─ zde je chyba\n`;
            }
        }
        
        output += '└─\n';
        
        if (this.suggestion) {
            output += `\n💡 Návrh: ${this.suggestion}\n`;
        }
        
        return output;
    }
}

class ErrorMessages {
    static SYNTAX_ERROR = {
        UNEXPECTED_TOKEN: (token) => ({
            message: `Neočekávaný token '${token}'`,
            suggestion: 'Zkontrolujte, zda máte správnou syntaxi'
        }),
        
        UNTERMINATED_STRING: () => ({
            message: 'Neukončený řetězec - chybí uzavírací uvozovka',
            suggestion: 'Přidejte " nebo \' na konec řetězce'
        }),
        
        UNEXPECTED_EOF: () => ({
            message: 'Neočekávaný konec souboru',
            suggestion: 'Možná chybí uzavírací závorka } nebo )'
        }),
        
        INVALID_NUMBER: (value) => ({
            message: `Neplatné číslo: ${value}`,
            suggestion: 'Zkontrolujte formát čísla'
        }),
        
        MISSING_SEMICOLON: () => ({
            message: 'Chybí středník na konci příkazu',
            suggestion: 'Přidejte ; na konec řádku'
        }),
        
        MISSING_PAREN: (expected, found) => ({
            message: `Očekávána závorka '${expected}', ale nalezena '${found}'`,
            suggestion: `Přidejte chybějící '${expected}'`
        })
    };
    
    static REFERENCE_ERROR = {
        UNDEFINED_VARIABLE: (name, similar) => ({
            message: `Proměnná '${name}' není definována`,
            suggestion: similar ? `Mysleli jste '${similar}'?` : 'Deklarujte proměnnou pomocí: proměnná ' + name + ' = ...'
        }),
        
        UNDEFINED_FUNCTION: (name) => ({
            message: `Funkce '${name}' neexistuje`,
            suggestion: 'Zkontrolujte, zda je funkce definována před voláním'
        }),
        
        NOT_A_FUNCTION: (name) => ({
            message: `'${name}' není funkce`,
            suggestion: 'Zkontrolujte, že voláte funkci a ne proměnnou'
        })
    };
    
    static TYPE_ERROR = {
        WRONG_TYPE: (expected, got) => ({
            message: `Očekáván typ '${expected}', ale získán '${got}'`,
            suggestion: `Převeďte hodnotu na typ ${expected}`
        }),
        
        CANNOT_READ_PROPERTY: (prop, type) => ({
            message: `Nelze přečíst vlastnost '${prop}' z ${type}`,
            suggestion: 'Zkontrolujte, že objekt není null nebo undefined'
        }),
        
        NOT_ITERABLE: (type) => ({
            message: `Hodnota typu '${type}' není iterovatelná`,
            suggestion: 'Pro iteraci použijte pole nebo jiný iterovatelný objekt'
        })
    };
    
    static CONST_ERROR = {
        REASSIGNMENT: (name) => ({
            message: `Nelze přiřadit novou hodnotu konstantě '${name}'`,
            suggestion: 'Použijte proměnnou místo konstanty: proměnná ' + name
        }),
        
        MISSING_INITIALIZER: (name) => ({
            message: `Konstanta '${name}' musí být inicializována`,
            suggestion: 'Přidejte hodnotu: konstanta ' + name + ' = hodnota'
        })
    };
    
    static IMPORT_ERROR = {
        MODULE_NOT_FOUND: (module) => ({
            message: `Modul '${module}' nebyl nalezen`,
            suggestion: 'Zkontrolujte cestu k modulu nebo jej nainstalujte'
        }),
        
        EXPORT_NOT_FOUND: (name, module) => ({
            message: `Export '${name}' v modulu '${module}' neexistuje`,
            suggestion: `Zkontrolujte, že modul exportuje '${name}'`
        })
    };
    
    static CLASS_ERROR = {
        SUPER_OUTSIDE_CLASS: () => ({
            message: 'Klíčové slovo super lze použít pouze ve třídě',
            suggestion: 'Přesuňte volání super do konstruktoru třídy'
        }),
        
        SUPER_BEFORE_THIS: () => ({
            message: 'Před použitím this musíte zavolat super()',
            suggestion: 'Zavolejte super() na začátku konstruktoru'
        }),
        
        MISSING_CONSTRUCTOR: () => ({
            message: 'Třída dědící od jiné třídy musí mít konstruktor',
            suggestion: 'Přidejte konstruktor s voláním super()'
        })
    };
    
    static ASYNC_ERROR = {
        AWAIT_OUTSIDE_ASYNC: () => ({
            message: 'await lze použít pouze v async funkci',
            suggestion: 'Přidejte async před definici funkce'
        }),
        
        PROMISE_REJECTION: (reason) => ({
            message: `Nespracované odmítnutí Promise: ${reason}`,
            suggestion: 'Použijte zkus-chyť blok pro zpracování chyb'
        })
    };
}

// Helper: Find similar variable names (for typo suggestions)
function findSimilar(name, availableNames, maxDistance = 2) {
    function levenshtein(a, b) {
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
    }
    
    let closest = null;
    let minDistance = Infinity;
    
    for (const available of availableNames) {
        const distance = levenshtein(name.toLowerCase(), available.toLowerCase());
        if (distance < minDistance && distance <= maxDistance) {
            minDistance = distance;
            closest = available;
        }
    }
    
    return closest;
}

// Enhanced error reporter
class ErrorReporter {
    constructor() {
        this.errors = [];
        this.warnings = [];
    }
    
    addError(type, message, location, suggestion = null) {
        const error = new CzechScriptError(message, type, location, suggestion);
        this.errors.push(error);
        return error;
    }
    
    addWarning(message, location) {
        this.warnings.push({ message, location });
    }
    
    syntaxError(subtype, location, ...args) {
        const { message, suggestion } = ErrorMessages.SYNTAX_ERROR[subtype](...args);
        return this.addError('Syntaktická chyba', message, location, suggestion);
    }
    
    referenceError(subtype, location, ...args) {
        const { message, suggestion } = ErrorMessages.REFERENCE_ERROR[subtype](...args);
        return this.addError('Chyba reference', message, location, suggestion);
    }
    
    typeError(subtype, location, ...args) {
        const { message, suggestion } = ErrorMessages.TYPE_ERROR[subtype](...args);
        return this.addError('Typová chyba', message, location, suggestion);
    }
    
    constError(subtype, location, ...args) {
        const { message, suggestion } = ErrorMessages.CONST_ERROR[subtype](...args);
        return this.addError('Chyba konstanty', message, location, suggestion);
    }
    
    importError(subtype, location, ...args) {
        const { message, suggestion } = ErrorMessages.IMPORT_ERROR[subtype](...args);
        return this.addError('Chyba importu', message, location, suggestion);
    }
    
    classError(subtype, location, ...args) {
        const { message, suggestion } = ErrorMessages.CLASS_ERROR[subtype](...args);
        return this.addError('Chyba třídy', message, location, suggestion);
    }
    
    asyncError(subtype, location, ...args) {
        const { message, suggestion } = ErrorMessages.ASYNC_ERROR[subtype](...args);
        return this.addError('Async chyba', message, location, suggestion);
    }
    
    hasErrors() {
        return this.errors.length > 0;
    }
    
    hasWarnings() {
        return this.warnings.length > 0;
    }
    
    clear() {
        this.errors = [];
        this.warnings = [];
    }
    
    printErrors(sourceCode) {
        this.errors.forEach(error => {
            console.error(error.format(sourceCode));
        });
    }
    
    printWarnings() {
        this.warnings.forEach(({ message, location }) => {
            console.warn(`\n⚠️  Varování (řádek ${location.line}): ${message}\n`);
        });
    }
}

module.exports = {
    CzechScriptError,
    ErrorMessages,
    ErrorReporter,
    findSimilar
};
