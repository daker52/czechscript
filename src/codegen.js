/**
 * CzechScript Code Generator
 * Převádí AST na JavaScript kód
 */

class CodeGenerator {
    constructor(ast, options = {}) {
        this.ast = ast;
        this.options = {
            indent: '    ',
            sourceMap: false,
            ...options
        };
        this.indentLevel = 0;
        this.output = '';
    }
    
    indent() {
        return this.options.indent.repeat(this.indentLevel);
    }
    
    generate() {
        this.output = '';
        this.generateNode(this.ast);
        return this.output;
    }
    
    generateNode(node) {
        if (!node) return '';
        
        const methodName = `generate${node.type}`;
        if (typeof this[methodName] === 'function') {
            return this[methodName](node);
        }
        
        throw new Error(`Neznámý typ uzlu: ${node.type}`);
    }
    
    // ===== PROGRAM =====
    
    generateProgram(node) {
        node.body.forEach(statement => {
            this.generateNode(statement);
        });
    }
    
    // ===== STATEMENTS =====
    
    generateVariableDeclaration(node) {
        this.output += this.indent();
        this.output += node.kind + ' ';
        
        node.declarations.forEach((decl, i) => {
            if (i > 0) this.output += ', ';
            this.generateNode(decl);
        });
        
        this.output += ';\n';
    }
    
    generateVariableDeclarator(node) {
        this.generateNode(node.id);
        
        if (node.init) {
            this.output += ' = ';
            this.generateNode(node.init);
        }
    }
    
    generateFunctionDeclaration(node) {
        this.output += this.indent();
        
        if (node.async) this.output += 'async ';
        this.output += 'function ';
        if (node.generator) this.output += '*';
        
        this.generateNode(node.id);
        this.output += '(';
        
        node.params.forEach((param, i) => {
            if (i > 0) this.output += ', ';
            this.output += param.name;
            if (param.defaultValue) {
                this.output += ' = ';
                this.generateNode(param.defaultValue);
            }
        });
        
        this.output += ') ';
        this.generateNode(node.body);
        this.output += '\n';
    }
    
    generateClassDeclaration(node) {
        this.output += this.indent();
        this.output += 'class ';
        this.generateNode(node.id);
        
        if (node.superClass) {
            this.output += ' extends ';
            this.generateNode(node.superClass);
        }
        
        this.output += ' {\n';
        this.indentLevel++;
        
        node.body.forEach(member => {
            this.generateNode(member);
        });
        
        this.indentLevel--;
        this.output += this.indent() + '}\n';
    }
    
    generateMethodDefinition(node) {
        this.output += this.indent();
        
        if (node.modifiers.includes('statické')) {
            this.output += 'static ';
        }
        
        if (node.kind === 'constructor') {
            this.output += 'constructor';
        } else {
            this.generateNode(node.key);
        }
        
        this.output += '(';
        node.params.forEach((param, i) => {
            if (i > 0) this.output += ', ';
            this.output += param.name;
            if (param.defaultValue) {
                this.output += ' = ';
                this.generateNode(param.defaultValue);
            }
        });
        this.output += ') ';
        
        this.generateNode(node.body);
        this.output += '\n';
    }
    
    generateIfStatement(node) {
        this.output += this.indent();
        this.output += 'if (';
        this.generateNode(node.test);
        this.output += ') ';
        
        if (node.consequent.type === 'BlockStatement') {
            this.generateNode(node.consequent);
        } else {
            this.output += '\n';
            this.indentLevel++;
            this.generateNode(node.consequent);
            this.indentLevel--;
        }
        
        if (node.alternate) {
            this.output += this.indent() + 'else ';
            
            if (node.alternate.type === 'BlockStatement' || node.alternate.type === 'IfStatement') {
                this.generateNode(node.alternate);
            } else {
                this.output += '\n';
                this.indentLevel++;
                this.generateNode(node.alternate);
                this.indentLevel--;
            }
        }
    }
    
    generateWhileStatement(node) {
        this.output += this.indent();
        this.output += 'while (';
        this.generateNode(node.test);
        this.output += ') ';
        this.generateNode(node.body);
    }
    
    generateForStatement(node) {
        this.output += this.indent();
        this.output += 'for (';
        
        if (node.init) {
            if (node.init.type === 'VariableDeclaration') {
                this.output += node.init.kind + ' ';
                node.init.declarations.forEach((decl, i) => {
                    if (i > 0) this.output += ', ';
                    this.generateNode(decl);
                });
            } else {
                this.generateNode(node.init);
            }
        }
        this.output += '; ';
        
        if (node.test) {
            this.generateNode(node.test);
        }
        this.output += '; ';
        
        if (node.update) {
            this.generateNode(node.update);
        }
        this.output += ') ';
        
        this.generateNode(node.body);
    }
    
    generateForOfStatement(node) {
        this.output += this.indent();
        this.output += 'for (';
        
        if (node.left.type === 'VariableDeclaration') {
            this.output += node.left.kind + ' ';
            this.generateNode(node.left.declarations[0].id);
        } else {
            this.generateNode(node.left);
        }
        
        this.output += ' of ';
        this.generateNode(node.right);
        this.output += ') ';
        this.generateNode(node.body);
    }
    
    generateReturnStatement(node) {
        this.output += this.indent() + 'return';
        
        if (node.argument) {
            this.output += ' ';
            this.generateNode(node.argument);
        }
        
        this.output += ';\n';
    }
    
    generateBreakStatement(node) {
        this.output += this.indent() + 'break;\n';
    }
    
    generateContinueStatement(node) {
        this.output += this.indent() + 'continue;\n';
    }
    
    generateTryStatement(node) {
        this.output += this.indent() + 'try ';
        this.generateNode(node.block);
        
        if (node.handler) {
            this.output += ' catch ';
            if (node.handler.param) {
                this.output += '(';
                this.generateNode(node.handler.param);
                this.output += ') ';
            }
            this.generateNode(node.handler.body);
        }
        
        if (node.finalizer) {
            this.output += ' finally ';
            this.generateNode(node.finalizer);
        }
        
        this.output += '\n';
    }
    
    generateThrowStatement(node) {
        this.output += this.indent() + 'throw ';
        this.generateNode(node.argument);
        this.output += ';\n';
    }
    
    generateImportDeclaration(node) {
        this.output += this.indent() + 'import ';
        
        if (node.specifiers.length > 0) {
            this.output += '{ ';
            node.specifiers.forEach((spec, i) => {
                if (i > 0) this.output += ', ';
                this.generateNode(spec.imported);
                if (spec.imported.name !== spec.local.name) {
                    this.output += ' as ';
                    this.generateNode(spec.local);
                }
            });
            this.output += ' } ';
        }
        
        this.output += 'from ';
        this.generateNode(node.source);
        this.output += ';\n';
    }
    
    generateExportNamedDeclaration(node) {
        this.output += this.indent() + 'export ';
        this.generateNode(node.declaration);
    }
    
    generateExportDefaultDeclaration(node) {
        this.output += this.indent() + 'export default ';
        this.generateNode(node.declaration);
    }
    
    generateBlockStatement(node) {
        this.output += '{\n';
        this.indentLevel++;
        
        node.body.forEach(statement => {
            this.generateNode(statement);
        });
        
        this.indentLevel--;
        this.output += this.indent() + '}\n';
    }
    
    generateExpressionStatement(node) {
        this.output += this.indent();
        this.generateNode(node.expression);
        this.output += ';\n';
    }
    
    // ===== EXPRESSIONS =====
    
    generateAssignmentExpression(node) {
        this.generateNode(node.left);
        this.output += ' ' + node.operator + ' ';
        this.generateNode(node.right);
    }
    
    generateBinaryExpression(node) {
        this.generateNode(node.left);
        this.output += ' ' + node.operator + ' ';
        this.generateNode(node.right);
    }
    
    generateLogicalExpression(node) {
        this.generateNode(node.left);
        this.output += ' ' + node.operator + ' ';
        this.generateNode(node.right);
    }
    
    generateUnaryExpression(node) {
        if (node.prefix) {
            this.output += node.operator;
            if (/[a-z]/i.test(node.operator)) {
                this.output += ' ';
            }
        }
        
        this.generateNode(node.argument);
        
        if (!node.prefix) {
            this.output += node.operator;
        }
    }
    
    generateUpdateExpression(node) {
        if (node.prefix) {
            this.output += node.operator;
        }
        
        this.generateNode(node.argument);
        
        if (!node.prefix) {
            this.output += node.operator;
        }
    }
    
    generateCallExpression(node) {
        this.generateNode(node.callee);
        this.output += '(';
        
        node.arguments.forEach((arg, i) => {
            if (i > 0) this.output += ', ';
            this.generateNode(arg);
        });
        
        this.output += ')';
    }
    
    generateMemberExpression(node) {
        this.generateNode(node.object);
        
        if (node.computed) {
            this.output += '[';
            this.generateNode(node.property);
            this.output += ']';
        } else {
            this.output += '.';
            this.generateNode(node.property);
        }
    }
    
    generateNewExpression(node) {
        this.output += 'new ';
        this.generateNode(node.callee);
        
        if (node.arguments.length > 0) {
            this.output += '(';
            node.arguments.forEach((arg, i) => {
                if (i > 0) this.output += ', ';
                this.generateNode(arg);
            });
            this.output += ')';
        }
    }
    
    generateArrayExpression(node) {
        this.output += '[';
        
        node.elements.forEach((elem, i) => {
            if (i > 0) this.output += ', ';
            this.generateNode(elem);
        });
        
        this.output += ']';
    }
    
    generateObjectExpression(node) {
        this.output += '{ ';
        
        node.properties.forEach((prop, i) => {
            if (i > 0) this.output += ', ';
            this.generateNode(prop);
        });
        
        this.output += ' }';
    }
    
    generateProperty(node) {
        this.generateNode(node.key);
        this.output += ': ';
        this.generateNode(node.value);
    }
    
    generateIdentifier(node) {
        this.output += node.name;
    }
    
    generateLiteral(node) {
        if (typeof node.value === 'string') {
            this.output += '"' + node.value.replace(/"/g, '\\"') + '"';
        } else if (node.value === null) {
            this.output += 'null';
        } else if (node.value === undefined) {
            this.output += 'undefined';
        } else {
            this.output += String(node.value);
        }
    }
    
    generateThisExpression(node) {
        this.output += 'this';
    }
}

module.exports = { CodeGenerator };
