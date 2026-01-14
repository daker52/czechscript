/**
 * CzechScript Lexer (Lexikální analyzátor)
 * Převádí zdrojový kód na tokeny
 */

class Token {
    constructor(type, value, line, column) {
        this.type = type;
        this.value = value;
        this.line = line;
        this.column = column;
    }
}

class Lexer {
    constructor(input) {
        this.input = input;
        this.position = 0;
        this.line = 1;
        this.column = 1;
        this.tokens = [];
        
        // Klíčová slova
        this.keywords = new Set([
            'proměnná', 'konstanta', 'funkce', 'vrať', 'když', 'pak', 'jinak',
            'dokud', 'opakuj', 'pro_každý', 'v', 'z', 'přeruš', 'pokračuj',
            'třída', 'konstruktor', 'tento', 'super', 'nový', 'rozšiřuje',
            'importuj', 'exportuj', 'jako', 'z', 'výchozí',
            'async', 'await', 'zkus', 'chyť', 'nakonec', 'hoď',
            'pravda', 'nepravda', 'null', 'nedefinováno',
            'typ', 'rozhraní', 'enum', 'veřejné', 'soukromé', 'chráněné',
            'statické', 'abstraktní', 'konečné', 'get', 'set',
            'a', 'nebo', 'ne', 'rovno', 'nerovno', 'větší', 'menší',
            'větší_rovno', 'menší_rovno', 'instanceof', 'typeof', 'delete',
            'yield', 'switch', 'case', 'default', 'do', 'with'
        ]);
        
        // Typy
        this.types = new Set([
            'číslo', 'řetězec', 'boolean', 'pole', 'objekt', 'funkce',
            'prázdné', 'jakýkoliv', 'nikdy', 'neznámý'
        ]);
    }
    
    currentChar() {
        return this.input[this.position];
    }
    
    peek(offset = 1) {
        return this.input[this.position + offset];
    }
    
    advance() {
        const char = this.currentChar();
        this.position++;
        
        if (char === '\n') {
            this.line++;
            this.column = 1;
        } else {
            this.column++;
        }
        
        return char;
    }
    
    skipWhitespace() {
        while (this.position < this.input.length && /\s/.test(this.currentChar())) {
            this.advance();
        }
    }
    
    skipComment() {
        if (this.currentChar() === '/' && this.peek() === '/') {
            // Jednořádkový komentář
            while (this.currentChar() && this.currentChar() !== '\n') {
                this.advance();
            }
        } else if (this.currentChar() === '/' && this.peek() === '*') {
            // Víceřádkový komentář
            this.advance(); // /
            this.advance(); // *
            
            while (this.position < this.input.length - 1) {
                if (this.currentChar() === '*' && this.peek() === '/') {
                    this.advance(); // *
                    this.advance(); // /
                    break;
                }
                this.advance();
            }
        }
    }
    
    readString(quote) {
        let value = '';
        const startLine = this.line;
        const startColumn = this.column;
        
        this.advance(); // Skip opening quote
        
        while (this.currentChar() && this.currentChar() !== quote) {
            if (this.currentChar() === '\\') {
                this.advance();
                const escaped = this.currentChar();
                
                switch (escaped) {
                    case 'n': value += '\n'; break;
                    case 't': value += '\t'; break;
                    case 'r': value += '\r'; break;
                    case '\\': value += '\\'; break;
                    case quote: value += quote; break;
                    default: value += escaped;
                }
                this.advance();
            } else {
                value += this.currentChar();
                this.advance();
            }
        }
        
        if (this.currentChar() !== quote) {
            throw new Error(`Neukončený řetězec na řádku ${startLine}:${startColumn}`);
        }
        
        this.advance(); // Skip closing quote
        
        return new Token('STRING', value, startLine, startColumn);
    }
    
    readNumber() {
        let value = '';
        const startLine = this.line;
        const startColumn = this.column;
        let hasDecimal = false;
        
        while (this.currentChar() && (/[0-9]/.test(this.currentChar()) || this.currentChar() === '.')) {
            if (this.currentChar() === '.') {
                if (hasDecimal) break;
                hasDecimal = true;
            }
            value += this.currentChar();
            this.advance();
        }
        
        // Podpora pro scientific notation (1e5, 2.5e-3)
        if (this.currentChar() === 'e' || this.currentChar() === 'E') {
            value += this.currentChar();
            this.advance();
            
            if (this.currentChar() === '+' || this.currentChar() === '-') {
                value += this.currentChar();
                this.advance();
            }
            
            while (this.currentChar() && /[0-9]/.test(this.currentChar())) {
                value += this.currentChar();
                this.advance();
            }
        }
        
        return new Token('NUMBER', parseFloat(value), startLine, startColumn);
    }
    
    readIdentifier() {
        let value = '';
        const startLine = this.line;
        const startColumn = this.column;
        
        while (this.currentChar() && /[a-záčďéěíňóřšťúůýžA-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ0-9_]/.test(this.currentChar())) {
            value += this.currentChar();
            this.advance();
        }
        
        // Zjistíme typ tokenu
        let type = 'IDENTIFIER';
        
        if (this.keywords.has(value)) {
            type = 'KEYWORD';
        } else if (this.types.has(value)) {
            type = 'TYPE';
        } else if (value === 'pravda' || value === 'nepravda') {
            type = 'BOOLEAN';
            value = value === 'pravda';
        } else if (value === 'null' || value === 'nedefinováno') {
            type = 'NULL';
        }
        
        return new Token(type, value, startLine, startColumn);
    }
    
    readOperator() {
        const startLine = this.line;
        const startColumn = this.column;
        let op = this.currentChar();
        this.advance();
        
        // Dvouznakové operátory
        const twoChar = op + (this.currentChar() || '');
        const twoCharOps = ['==', '!=', '<=', '>=', '&&', '||', '++', '--', '+=', '-=', '*=', '/=', '%=', '**', '=>', '??', '?.'];
        
        if (twoCharOps.includes(twoChar)) {
            this.advance();
            op = twoChar;
        }
        
        // Tříznakové operátory
        const threeChar = op + (this.currentChar() || '');
        const threeCharOps = ['===', '!==', '...', '**=', '&&=', '||=', '??='];
        
        if (threeCharOps.includes(threeChar)) {
            this.advance();
            op = threeChar;
        }
        
        return new Token('OPERATOR', op, startLine, startColumn);
    }
    
    tokenize() {
        this.tokens = [];
        
        while (this.position < this.input.length) {
            this.skipWhitespace();
            
            if (this.position >= this.input.length) break;
            
            // Komentáře
            if (this.currentChar() === '/' && (this.peek() === '/' || this.peek() === '*')) {
                this.skipComment();
                continue;
            }
            
            const char = this.currentChar();
            const line = this.line;
            const column = this.column;
            
            // Řetězce
            if (char === '"' || char === "'" || char === '`') {
                this.tokens.push(this.readString(char));
                continue;
            }
            
            // Čísla
            if (/[0-9]/.test(char)) {
                this.tokens.push(this.readNumber());
                continue;
            }
            
            // Identifikátory a klíčová slova
            if (/[a-záčďéěíňóřšťúůýžA-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ_]/.test(char)) {
                this.tokens.push(this.readIdentifier());
                continue;
            }
            
            // Operátory a speciální znaky
            if ('+-*/%=<>!&|^~?'.includes(char)) {
                this.tokens.push(this.readOperator());
                continue;
            }
            
            // Závorky a oddělovače
            if ('(){}[],.;:'.includes(char)) {
                this.tokens.push(new Token('PUNCTUATION', char, line, column));
                this.advance();
                continue;
            }
            
            throw new Error(`Neznámý znak '${char}' na řádku ${line}:${column}`);
        }
        
        this.tokens.push(new Token('EOF', null, this.line, this.column));
        return this.tokens;
    }
}

module.exports = { Lexer, Token };
