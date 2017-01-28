let isNode = false;
if(typeof require !== "undefined")
    isNode = true;

class ShuntingOperator {
    constructor(opts){
        this.name = opts.name;
        this.precedence = opts.precedence;
        this.variants = opts.variants;
        this.associativity = opts.associativity;
        this.opts = opts;
    }
    
    clone(){
        return new ShuntingOperator(this.opts);
    }
    
    toString(){
        return `[Op ${this.name} ${this.arity ? this.arity : "<unset>"}]`;
    }
}

class ShuntingYard {
    constructor(system, opts = {}){
        this.opts = {
            grouping: {
                left: "(",
                right: ")",
                separator: ",",
            },
            isLiteral: /^\d+$/,
            isFunction: /[]/,
            isSeparator: (e) => e == this.opts.grouping.separator,
            includeFunctionArity: true,
            unaryPrec: 1000,
        };
        Object.assign(this.opts, opts);
        for(let prop of ["isLiteral", "isFunction", "isSeparator"]){
            if(this.opts[prop] instanceof RegExp)
                this.opts[prop] = RegExp.prototype.test.bind(this.opts[prop]);
            this[prop] = this.opts[prop];
        }
        
        this.system = new Map(system.map(e => [e.name, e]));
    }
    
    parse(tokens){
        let outQueue = [];
        let opStack = [];
        let topOp = () => opStack[opStack.length - 1];
        let pToken = null;
        // parse monadic operators
        for(let i = 0; i < tokens.length; i++){
            let token = tokens[i];
            if(this.system.has(token)){
                token = this.system.get(token).clone();
                if(!pToken || pToken instanceof ShuntingOperator){
                    token.arity = 1;
                    token.precedence = this.opts.unaryPrec;
                    token.associativity = "right";
                }
                else
                    token.arity = 2;
                if(!token.variants.includes(token.arity)){
                    throw new Error("unexpected `" + token.name + "` at pos " + i);
                }
            }
            tokens[i] = pToken = token;
        }
        
        let arities = [];
        pToken = null;
        for(let token of tokens){
            if(this.isLiteral(token)){
                outQueue.push(token);
            } else if(this.isFunction(token)){
                opStack.push(token);
            } else if(this.isSeparator(token)){
                arities[arities.length - 1]++;
                while(topOp() !== this.opts.grouping.left){
                    if(opStack.length === 0){
                        throw new Error("unmatched grouping; expected a `" + this.opts.grouping.right + "`");
                    }
                    outQueue.push(opStack.pop());
                }
            } else if(token instanceof ShuntingOperator){
                let foundOp = token;
                while(topOp() && (
                    foundOp.associativity === "left"
                        ? foundOp.precedence <= topOp().precedence
                        : foundOp.precedence <  topOp().precedence
                    )
                )
                    outQueue.push(opStack.pop());
                opStack.push(foundOp);
            } else if(token === this.opts.grouping.left){
                opStack.push(token);
                arities.push(0);
            } else if(token === this.opts.grouping.right){
                let arity = arities.pop();
                if(pToken !== this.opts.grouping.left)
                    arity++;
                while(topOp() !== this.opts.grouping.left){
                    if(opStack.length === 0)
                        throw new Error("unmatched grouping; expected a `" + this.opts.grouping.left + "`");
                    console.log(topOp());
                    outQueue.push(opStack.pop());
                }
                opStack.pop();  // remove left grouping
                if(this.isFunction(topOp())){
                    if(this.opts.includeFunctionArity)
                        outQueue.push(arity);
                    outQueue.push(opStack.pop());
                }
            } else {
                throw new Error("unhandled token `" + token + "`");
            }
            pToken = token;
        }
        while(opStack.length){
            // todo: handle paren mismatch
            let next = opStack.pop();
            outQueue.push(next);
        }
        return outQueue;
    }
}

ShuntingYard.ShuntingOperator = ShuntingOperator;

ShuntingYard.simple = new ShuntingYard([
    new ShuntingOperator({
        name: "+",
        precedence: 2,
        variants: [2],
        associativity: "left",
    }),
    new ShuntingOperator({
        name: "-",
        precedence: 2,
        variants: [1, 2],
        associativity: "left",
    }),
    new ShuntingOperator({
        name: "*",
        precedence: 3,
        variants: [2],
        associativity: "left",
    }),
    new ShuntingOperator({
        name: "/",
        precedence: 3,
        variants: [2],
        associativity: "left",
    }),
    new ShuntingOperator({
        name: "^",
        precedence: 4,
        variants: [2],
        associativity: "right",
    }),
]);

if(isNode)
    module.exports = exports.default = ShuntingYard;