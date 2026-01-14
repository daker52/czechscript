/**
 * CzechScript Compiler
 * Kompiluje CzechScript kód do JavaScriptu
 */

const { Lexer } = require('./lexer');
const { Parser } = require('./parser');
const { CodeGenerator } = require('./codegen');

class CzechScriptCompiler {
    constructor(options = {}) {
        this.options = {
            target: 'es2020',
            module: 'esm',
            sourceMap: false,
            optimize: true,
            strict: true,
            ...options
        };
        
        this.errors = [];
        this.warnings = [];
    }
    
    compile(source, filename = 'source.cs') {
        this.errors = [];
        this.warnings = [];
        
        try {
            // 1. Lexikální analýza
            const lexer = new Lexer(source);
            const tokens = lexer.tokenize();
            
            // 2. Syntaktická analýza
            const parser = new Parser(tokens);
            const ast = parser.parse();
            
            // 3. Sémantická analýza (type checking, scope checking)
            if (this.options.strict) {
                this.analyze(ast);
            }
            
            // 4. Optimalizace
            if (this.options.optimize) {
                this.optimize(ast);
            }
            
            // 5. Generování kódu
            const generator = new CodeGenerator(ast, {
                indent: '    ',
                sourceMap: this.options.sourceMap
            });
            
            const code = generator.generate();
            
            return {
                success: true,
                code,
                ast,
                tokens,
                errors: this.errors,
                warnings: this.warnings
            };
            
        } catch (error) {
            this.errors.push({
                type: 'CompileError',
                message: error.message,
                filename
            });
            
            return {
                success: false,
                code: null,
                ast: null,
                tokens: null,
                errors: this.errors,
                warnings: this.warnings
            };
        }
    }
    
    analyze(ast) {
        // Scope tracking
        const scopes = [new Map()]; // Global scope
        
        const visit = (node) => {
            if (!node) return;
            
            switch (node.type) {
                case 'Program':
                case 'BlockStatement':
                    scopes.push(new Map());
                    node.body.forEach(visit);
                    scopes.pop();
                    break;
                
                case 'VariableDeclaration':
                    node.declarations.forEach(decl => {
                        const scope = scopes[scopes.length - 1];
                        
                        if (scope.has(decl.id.name)) {
                            this.errors.push({
                                type: 'RedeclarationError',
                                message: `Proměnná '${decl.id.name}' je již deklarována`,
                                node: decl
                            });
                        }
                        
                        scope.set(decl.id.name, {
                            type: node.kind,
                            initialized: decl.init !== null
                        });
                        
                        if (decl.init) {
                            visit(decl.init);
                        }
                    });
                    break;
                
                case 'FunctionDeclaration':
                    const funcScope = scopes[scopes.length - 1];
                    funcScope.set(node.id.name, { type: 'function' });
                    
                    scopes.push(new Map());
                    node.params.forEach(param => {
                        scopes[scopes.length - 1].set(param.name, { type: 'parameter' });
                    });
                    visit(node.body);
                    scopes.pop();
                    break;
                
                case 'Identifier':
                    // Check if identifier is defined
                    const isDefined = scopes.some(scope => scope.has(node.name));
                    
                    if (!isDefined && !this.isBuiltin(node.name)) {
                        this.warnings.push({
                            type: 'UndefinedVariable',
                            message: `Proměnná '${node.name}' není definována`,
                            node
                        });
                    }
                    break;
                
                case 'AssignmentExpression':
                    // Check const reassignment
                    if (node.left.type === 'Identifier') {
                        for (let i = scopes.length - 1; i >= 0; i--) {
                            if (scopes[i].has(node.left.name)) {
                                const varInfo = scopes[i].get(node.left.name);
                                if (varInfo.type === 'const') {
                                    this.errors.push({
                                        type: 'ConstAssignment',
                                        message: `Nelze přiřadit hodnotu konstantě '${node.left.name}'`,
                                        node
                                    });
                                }
                                break;
                            }
                        }
                    }
                    
                    visit(node.left);
                    visit(node.right);
                    break;
                
                default:
                    // Recursively visit all properties
                    for (const key in node) {
                        if (node[key] && typeof node[key] === 'object') {
                            if (Array.isArray(node[key])) {
                                node[key].forEach(visit);
                            } else if (node[key].type) {
                                visit(node[key]);
                            }
                        }
                    }
            }
        };
        
        visit(ast);
    }
    
    isBuiltin(name) {
        const builtins = [
            'console', 'document', 'window', 'Math', 'Date', 'Array', 'Object',
            'String', 'Number', 'Boolean', 'JSON', 'Promise', 'Set', 'Map',
            'parseInt', 'parseFloat', 'isNaN', 'isFinite', 'setTimeout', 'setInterval'
        ];
        
        return builtins.includes(name);
    }
    
    optimize(ast) {
        // Constant folding
        const foldConstants = (node) => {
            if (!node) return node;
            
            if (node.type === 'BinaryExpression') {
                node.left = foldConstants(node.left);
                node.right = foldConstants(node.right);
                
                // If both operands are literals, compute at compile time
                if (node.left.type === 'Literal' && node.right.type === 'Literal') {
                    let result;
                    
                    switch (node.operator) {
                        case '+':
                            result = node.left.value + node.right.value;
                            break;
                        case '-':
                            result = node.left.value - node.right.value;
                            break;
                        case '*':
                            result = node.left.value * node.right.value;
                            break;
                        case '/':
                            result = node.left.value / node.right.value;
                            break;
                        case '%':
                            result = node.left.value % node.right.value;
                            break;
                        case '**':
                            result = node.left.value ** node.right.value;
                            break;
                        default:
                            return node;
                    }
                    
                    return {
                        type: 'Literal',
                        value: result
                    };
                }
            }
            
            // Recursively optimize
            for (const key in node) {
                if (node[key] && typeof node[key] === 'object') {
                    if (Array.isArray(node[key])) {
                        node[key] = node[key].map(foldConstants);
                    } else if (node[key].type) {
                        node[key] = foldConstants(node[key]);
                    }
                }
            }
            
            return node;
        };
        
        foldConstants(ast);
    }
    
    compileFile(source, filename) {
        return this.compile(source, filename);
    }
    
    compileToAST(source) {
        const lexer = new Lexer(source);
        const tokens = lexer.tokenize();
        const parser = new Parser(tokens);
        return parser.parse();
    }
}

module.exports = { CzechScriptCompiler };
