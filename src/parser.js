/**
 * CzechScript Parser (Syntaktický analyzátor)
 * Převádí tokeny na AST (Abstract Syntax Tree)
 */

class ASTNode {
    constructor(type, props = {}) {
        this.type = type;
        Object.assign(this, props);
    }
}

class Parser {
    constructor(tokens) {
        this.tokens = tokens;
        this.position = 0;
    }
    
    currentToken() {
        return this.tokens[this.position];
    }
    
    peek(offset = 1) {
        return this.tokens[this.position + offset];
    }
    
    advance() {
        return this.tokens[this.position++];
    }
    
    expect(type, value = null) {
        const token = this.currentToken();
        
        if (token.type !== type) {
            throw new Error(`Očekáván ${type}, ale nalezen ${token.type} na řádku ${token.line}:${token.column}`);
        }
        
        if (value !== null && token.value !== value) {
            throw new Error(`Očekávána hodnota '${value}', ale nalezena '${token.value}' na řádku ${token.line}:${token.column}`);
        }
        
        return this.advance();
    }
    
    // ===== HLAVNÍ PARSER =====
    
    parse() {
        const program = new ASTNode('Program', {
            body: []
        });
        
        while (this.currentToken().type !== 'EOF') {
            program.body.push(this.parseStatement());
        }
        
        return program;
    }
    
    // ===== STATEMENTS =====
    
    parseStatement() {
        const token = this.currentToken();
        
        switch (token.type) {
            case 'KEYWORD':
                switch (token.value) {
                    case 'proměnná':
                    case 'konstanta':
                        return this.parseVariableDeclaration();
                    case 'funkce':
                        return this.parseFunctionDeclaration();
                    case 'třída':
                        return this.parseClassDeclaration();
                    case 'když':
                        return this.parseIfStatement();
                    case 'dokud':
                        return this.parseWhileStatement();
                    case 'opakuj':
                        return this.parseForStatement();
                    case 'pro_každý':
                        return this.parseForEachStatement();
                    case 'vrať':
                        return this.parseReturnStatement();
                    case 'přeruš':
                        return this.parseBreakStatement();
                    case 'pokračuj':
                        return this.parseContinueStatement();
                    case 'zkus':
                        return this.parseTryStatement();
                    case 'hoď':
                        return this.parseThrowStatement();
                    case 'importuj':
                        return this.parseImportStatement();
                    case 'exportuj':
                        return this.parseExportStatement();
                    default:
                        return this.parseExpressionStatement();
                }
            default:
                return this.parseExpressionStatement();
        }
    }
    
    parseVariableDeclaration() {
        const token = this.advance();
        const kind = token.value === 'konstanta' ? 'const' : 'let';
        
        const declarations = [];
        
        do {
            if (this.currentToken().value === ',') {
                this.advance();
            }
            
            const id = this.expect('IDENTIFIER');
            let typeAnnotation = null;
            let init = null;
            
            // Type annotation
            if (this.currentToken().value === ':') {
                this.advance();
                typeAnnotation = this.parseType();
            }
            
            // Initializer
            if (this.currentToken().value === '=') {
                this.advance();
                init = this.parseExpression();
            }
            
            declarations.push(new ASTNode('VariableDeclarator', {
                id: new ASTNode('Identifier', { name: id.value }),
                typeAnnotation,
                init
            }));
        } while (this.currentToken().value === ',');
        
        this.expectSemicolon();
        
        return new ASTNode('VariableDeclaration', {
            kind,
            declarations
        });
    }
    
    parseFunctionDeclaration() {
        this.advance(); // 'funkce'
        
        const id = this.expect('IDENTIFIER');
        const params = this.parseFunctionParams();
        
        let returnType = null;
        if (this.currentToken().value === ':') {
            this.advance();
            returnType = this.parseType();
        }
        
        const body = this.parseBlockStatement();
        
        return new ASTNode('FunctionDeclaration', {
            id: new ASTNode('Identifier', { name: id.value }),
            params,
            returnType,
            body,
            async: false,
            generator: false
        });
    }
    
    parseFunctionParams() {
        this.expect('PUNCTUATION', '(');
        const params = [];
        
        while (this.currentToken().value !== ')') {
            if (params.length > 0) {
                this.expect('PUNCTUATION', ',');
            }
            
            const param = this.expect('IDENTIFIER');
            let typeAnnotation = null;
            let defaultValue = null;
            
            // Type annotation
            if (this.currentToken().value === ':') {
                this.advance();
                typeAnnotation = this.parseType();
            }
            
            // Default value
            if (this.currentToken().value === '=') {
                this.advance();
                defaultValue = this.parseExpression();
            }
            
            params.push(new ASTNode('Parameter', {
                name: param.value,
                typeAnnotation,
                defaultValue
            }));
        }
        
        this.expect('PUNCTUATION', ')');
        return params;
    }
    
    parseClassDeclaration() {
        this.advance(); // 'třída'
        
        const id = this.expect('IDENTIFIER');
        let superClass = null;
        
        if (this.currentToken().value === 'rozšiřuje') {
            this.advance();
            superClass = this.expect('IDENTIFIER');
        }
        
        this.expect('PUNCTUATION', '{');
        
        const body = [];
        while (this.currentToken().value !== '}') {
            body.push(this.parseClassMember());
        }
        
        this.expect('PUNCTUATION', '}');
        
        return new ASTNode('ClassDeclaration', {
            id: new ASTNode('Identifier', { name: id.value }),
            superClass: superClass ? new ASTNode('Identifier', { name: superClass.value }) : null,
            body
        });
    }
    
    parseClassMember() {
        const modifiers = [];
        
        // Modifiers
        while (['statické', 'soukromé', 'veřejné', 'chráněné'].includes(this.currentToken().value)) {
            modifiers.push(this.advance().value);
        }
        
        if (this.currentToken().value === 'konstruktor') {
            this.advance();
            const params = this.parseFunctionParams();
            const body = this.parseBlockStatement();
            
            return new ASTNode('MethodDefinition', {
                kind: 'constructor',
                key: new ASTNode('Identifier', { name: 'konstruktor' }),
                params,
                body,
                modifiers
            });
        }
        
        const key = this.expect('IDENTIFIER');
        const params = this.parseFunctionParams();
        
        let returnType = null;
        if (this.currentToken().value === ':') {
            this.advance();
            returnType = this.parseType();
        }
        
        const body = this.parseBlockStatement();
        
        return new ASTNode('MethodDefinition', {
            kind: 'method',
            key: new ASTNode('Identifier', { name: key.value }),
            params,
            returnType,
            body,
            modifiers
        });
    }
    
    parseIfStatement() {
        this.advance(); // 'když'
        
        this.expect('PUNCTUATION', '(');
        const test = this.parseExpression();
        this.expect('PUNCTUATION', ')');
        
        // Optional 'pak'
        if (this.currentToken().value === 'pak') {
            this.advance();
        }
        
        const consequent = this.parseBlockOrStatement();
        let alternate = null;
        
        if (this.currentToken().value === 'jinak') {
            this.advance();
            alternate = this.parseBlockOrStatement();
        }
        
        return new ASTNode('IfStatement', {
            test,
            consequent,
            alternate
        });
    }
    
    parseWhileStatement() {
        this.advance(); // 'dokud'
        
        this.expect('PUNCTUATION', '(');
        const test = this.parseExpression();
        this.expect('PUNCTUATION', ')');
        
        const body = this.parseBlockOrStatement();
        
        return new ASTNode('WhileStatement', {
            test,
            body
        });
    }
    
    parseForStatement() {
        this.advance(); // 'opakuj'
        
        this.expect('PUNCTUATION', '(');
        const times = this.parseExpression();
        this.expect('PUNCTUATION', ')');
        
        const body = this.parseBlockOrStatement();
        
        // Převod na for loop: for (let i = 0; i < times; i++)
        return new ASTNode('ForStatement', {
            init: new ASTNode('VariableDeclaration', {
                kind: 'let',
                declarations: [
                    new ASTNode('VariableDeclarator', {
                        id: new ASTNode('Identifier', { name: '__i' }),
                        init: new ASTNode('Literal', { value: 0 })
                    })
                ]
            }),
            test: new ASTNode('BinaryExpression', {
                operator: '<',
                left: new ASTNode('Identifier', { name: '__i' }),
                right: times
            }),
            update: new ASTNode('UpdateExpression', {
                operator: '++',
                argument: new ASTNode('Identifier', { name: '__i' }),
                prefix: false
            }),
            body
        });
    }
    
    parseForEachStatement() {
        this.advance(); // 'pro_každý'
        
        this.expect('PUNCTUATION', '(');
        const left = this.expect('IDENTIFIER');
        this.expect('KEYWORD', 'v');
        const right = this.parseExpression();
        this.expect('PUNCTUATION', ')');
        
        const body = this.parseBlockOrStatement();
        
        return new ASTNode('ForOfStatement', {
            left: new ASTNode('VariableDeclaration', {
                kind: 'const',
                declarations: [
                    new ASTNode('VariableDeclarator', {
                        id: new ASTNode('Identifier', { name: left.value }),
                        init: null
                    })
                ]
            }),
            right,
            body
        });
    }
    
    parseReturnStatement() {
        this.advance(); // 'vrať'
        
        let argument = null;
        if (this.currentToken().type !== 'PUNCTUATION' || this.currentToken().value !== ';') {
            argument = this.parseExpression();
        }
        
        this.expectSemicolon();
        
        return new ASTNode('ReturnStatement', { argument });
    }
    
    parseBreakStatement() {
        this.advance();
        this.expectSemicolon();
        return new ASTNode('BreakStatement');
    }
    
    parseContinueStatement() {
        this.advance();
        this.expectSemicolon();
        return new ASTNode('ContinueStatement');
    }
    
    parseTryStatement() {
        this.advance(); // 'zkus'
        
        const block = this.parseBlockStatement();
        let handler = null;
        let finalizer = null;
        
        if (this.currentToken().value === 'chyť') {
            this.advance();
            
            let param = null;
            if (this.currentToken().value === '(') {
                this.advance();
                param = this.expect('IDENTIFIER');
                this.expect('PUNCTUATION', ')');
            }
            
            const body = this.parseBlockStatement();
            
            handler = new ASTNode('CatchClause', {
                param: param ? new ASTNode('Identifier', { name: param.value }) : null,
                body
            });
        }
        
        if (this.currentToken().value === 'nakonec') {
            this.advance();
            finalizer = this.parseBlockStatement();
        }
        
        return new ASTNode('TryStatement', {
            block,
            handler,
            finalizer
        });
    }
    
    parseThrowStatement() {
        this.advance(); // 'hoď'
        const argument = this.parseExpression();
        this.expectSemicolon();
        
        return new ASTNode('ThrowStatement', { argument });
    }
    
    parseImportStatement() {
        this.advance(); // 'importuj'
        
        const specifiers = [];
        let source = null;
        
        // import { a, b } z "modul"
        if (this.currentToken().value === '{') {
            this.advance();
            
            while (this.currentToken().value !== '}') {
                if (specifiers.length > 0) {
                    this.expect('PUNCTUATION', ',');
                }
                
                const imported = this.expect('IDENTIFIER');
                let local = imported;
                
                if (this.currentToken().value === 'jako') {
                    this.advance();
                    local = this.expect('IDENTIFIER');
                }
                
                specifiers.push(new ASTNode('ImportSpecifier', {
                    imported: new ASTNode('Identifier', { name: imported.value }),
                    local: new ASTNode('Identifier', { name: local.value })
                }));
            }
            
            this.expect('PUNCTUATION', '}');
        }
        
        if (this.currentToken().value === 'z') {
            this.advance();
            source = this.expect('STRING');
        }
        
        this.expectSemicolon();
        
        return new ASTNode('ImportDeclaration', {
            specifiers,
            source: new ASTNode('Literal', { value: source.value })
        });
    }
    
    parseExportStatement() {
        this.advance(); // 'exportuj'
        
        if (this.currentToken().value === 'výchozí') {
            this.advance();
            const declaration = this.parseStatement();
            
            return new ASTNode('ExportDefaultDeclaration', {
                declaration
            });
        }
        
        const declaration = this.parseStatement();
        
        return new ASTNode('ExportNamedDeclaration', {
            declaration,
            specifiers: []
        });
    }
    
    parseBlockStatement() {
        this.expect('PUNCTUATION', '{');
        
        const body = [];
        while (this.currentToken().value !== '}') {
            body.push(this.parseStatement());
        }
        
        this.expect('PUNCTUATION', '}');
        
        return new ASTNode('BlockStatement', { body });
    }
    
    parseBlockOrStatement() {
        if (this.currentToken().value === '{') {
            return this.parseBlockStatement();
        }
        return this.parseStatement();
    }
    
    parseExpressionStatement() {
        const expression = this.parseExpression();
        this.expectSemicolon();
        
        return new ASTNode('ExpressionStatement', { expression });
    }
    
    // ===== EXPRESSIONS =====
    
    parseExpression() {
        return this.parseAssignmentExpression();
    }
    
    parseAssignmentExpression() {
        const left = this.parseLogicalOrExpression();
        
        const assignOps = ['=', '+=', '-=', '*=', '/=', '%=', '**=', '&&=', '||=', '??='];
        if (this.currentToken().type === 'OPERATOR' && assignOps.includes(this.currentToken().value)) {
            const operator = this.advance().value;
            const right = this.parseAssignmentExpression();
            
            return new ASTNode('AssignmentExpression', {
                operator,
                left,
                right
            });
        }
        
        return left;
    }
    
    parseLogicalOrExpression() {
        let left = this.parseLogicalAndExpression();
        
        while (this.currentToken().value === 'nebo' || this.currentToken().value === '||') {
            const operator = this.advance();
            const right = this.parseLogicalAndExpression();
            
            left = new ASTNode('LogicalExpression', {
                operator: '||',
                left,
                right
            });
        }
        
        return left;
    }
    
    parseLogicalAndExpression() {
        let left = this.parseEqualityExpression();
        
        while (this.currentToken().value === 'a' || this.currentToken().value === '&&') {
            const operator = this.advance();
            const right = this.parseEqualityExpression();
            
            left = new ASTNode('LogicalExpression', {
                operator: '&&',
                left,
                right
            });
        }
        
        return left;
    }
    
    parseEqualityExpression() {
        let left = this.parseRelationalExpression();
        
        const eqOps = ['rovno', '==', '===', 'nerovno', '!=', '!=='];
        while (eqOps.includes(this.currentToken().value)) {
            const op = this.advance().value;
            const operator = op === 'rovno' ? '===' : op === 'nerovno' ? '!==' : op;
            const right = this.parseRelationalExpression();
            
            left = new ASTNode('BinaryExpression', {
                operator,
                left,
                right
            });
        }
        
        return left;
    }
    
    parseRelationalExpression() {
        let left = this.parseAdditiveExpression();
        
        const relOps = ['větší', '>', 'menší', '<', 'větší_rovno', '>=', 'menší_rovno', '<='];
        while (relOps.includes(this.currentToken().value)) {
            const op = this.advance().value;
            const operator = {
                'větší': '>',
                'menší': '<',
                'větší_rovno': '>=',
                'menší_rovno': '<='
            }[op] || op;
            
            const right = this.parseAdditiveExpression();
            
            left = new ASTNode('BinaryExpression', {
                operator,
                left,
                right
            });
        }
        
        return left;
    }
    
    parseAdditiveExpression() {
        let left = this.parseMultiplicativeExpression();
        
        while (['+', '-'].includes(this.currentToken().value)) {
            const operator = this.advance().value;
            const right = this.parseMultiplicativeExpression();
            
            left = new ASTNode('BinaryExpression', {
                operator,
                left,
                right
            });
        }
        
        return left;
    }
    
    parseMultiplicativeExpression() {
        let left = this.parseUnaryExpression();
        
        while (['*', '/', '%', '**'].includes(this.currentToken().value)) {
            const operator = this.advance().value;
            const right = this.parseUnaryExpression();
            
            left = new ASTNode('BinaryExpression', {
                operator,
                left,
                right
            });
        }
        
        return left;
    }
    
    parseUnaryExpression() {
        if (['ne', '!', '-', '+', '++', '--', 'typeof', 'delete'].includes(this.currentToken().value)) {
            const op = this.advance().value;
            const operator = op === 'ne' ? '!' : op;
            const argument = this.parseUnaryExpression();
            
            return new ASTNode('UnaryExpression', {
                operator,
                argument,
                prefix: true
            });
        }
        
        return this.parsePostfixExpression();
    }
    
    parsePostfixExpression() {
        let expr = this.parseCallExpression();
        
        if (['++', '--'].includes(this.currentToken().value)) {
            const operator = this.advance().value;
            
            return new ASTNode('UpdateExpression', {
                operator,
                argument: expr,
                prefix: false
            });
        }
        
        return expr;
    }
    
    parseCallExpression() {
        let expr = this.parseMemberExpression();
        
        while (this.currentToken().value === '(') {
            const args = this.parseArguments();
            
            expr = new ASTNode('CallExpression', {
                callee: expr,
                arguments: args
            });
        }
        
        return expr;
    }
    
    parseMemberExpression() {
        let expr = this.parsePrimaryExpression();
        
        while (this.currentToken().value === '.' || this.currentToken().value === '[') {
            if (this.currentToken().value === '.') {
                this.advance();
                const property = this.expect('IDENTIFIER');
                
                expr = new ASTNode('MemberExpression', {
                    object: expr,
                    property: new ASTNode('Identifier', { name: property.value }),
                    computed: false
                });
            } else {
                this.advance(); // '['
                const property = this.parseExpression();
                this.expect('PUNCTUATION', ']');
                
                expr = new ASTNode('MemberExpression', {
                    object: expr,
                    property,
                    computed: true
                });
            }
        }
        
        return expr;
    }
    
    parsePrimaryExpression() {
        const token = this.currentToken();
        
        switch (token.type) {
            case 'NUMBER':
            case 'STRING':
            case 'BOOLEAN':
            case 'NULL':
                this.advance();
                return new ASTNode('Literal', { value: token.value });
            
            case 'IDENTIFIER':
                this.advance();
                return new ASTNode('Identifier', { name: token.value });
            
            case 'KEYWORD':
                if (token.value === 'nový') {
                    return this.parseNewExpression();
                }
                if (token.value === 'tento') {
                    this.advance();
                    return new ASTNode('ThisExpression');
                }
                break;
            
            case 'PUNCTUATION':
                if (token.value === '(') {
                    this.advance();
                    const expr = this.parseExpression();
                    this.expect('PUNCTUATION', ')');
                    return expr;
                }
                if (token.value === '[') {
                    return this.parseArrayExpression();
                }
                if (token.value === '{') {
                    return this.parseObjectExpression();
                }
                break;
        }
        
        throw new Error(`Neočekávaný token ${token.type} na řádku ${token.line}:${token.column}`);
    }
    
    parseNewExpression() {
        this.advance(); // 'nový'
        
        const callee = this.parseMemberExpression();
        const args = this.currentToken().value === '(' ? this.parseArguments() : [];
        
        return new ASTNode('NewExpression', {
            callee,
            arguments: args
        });
    }
    
    parseArrayExpression() {
        this.expect('PUNCTUATION', '[');
        
        const elements = [];
        while (this.currentToken().value !== ']') {
            if (elements.length > 0) {
                this.expect('PUNCTUATION', ',');
            }
            
            if (this.currentToken().value === ']') break;
            
            elements.push(this.parseExpression());
        }
        
        this.expect('PUNCTUATION', ']');
        
        return new ASTNode('ArrayExpression', { elements });
    }
    
    parseObjectExpression() {
        this.expect('PUNCTUATION', '{');
        
        const properties = [];
        while (this.currentToken().value !== '}') {
            if (properties.length > 0) {
                this.expect('PUNCTUATION', ',');
            }
            
            if (this.currentToken().value === '}') break;
            
            const key = this.expect('IDENTIFIER');
            this.expect('PUNCTUATION', ':');
            const value = this.parseExpression();
            
            properties.push(new ASTNode('Property', {
                key: new ASTNode('Identifier', { name: key.value }),
                value
            }));
        }
        
        this.expect('PUNCTUATION', '}');
        
        return new ASTNode('ObjectExpression', { properties });
    }
    
    parseArguments() {
        this.expect('PUNCTUATION', '(');
        
        const args = [];
        while (this.currentToken().value !== ')') {
            if (args.length > 0) {
                this.expect('PUNCTUATION', ',');
            }
            
            args.push(this.parseExpression());
        }
        
        this.expect('PUNCTUATION', ')');
        
        return args;
    }
    
    parseType() {
        const type = this.advance();
        return new ASTNode('TypeAnnotation', {
            typeAnnotation: new ASTNode('Type', { name: type.value })
        });
    }
    
    expectSemicolon() {
        if (this.currentToken().value === ';') {
            this.advance();
        }
        // ASI - Automatic Semicolon Insertion
    }
}

module.exports = { Parser, ASTNode };
