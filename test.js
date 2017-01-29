const ShuntingYard = require("./shunt.js");
const ShuntingOperator = ShuntingYard.ShuntingOperator;

ShuntingYard.simple.isFunction = (e) => e === "f" || e[0] === "$";

console.log(ShuntingYard.simple.parse("( 3 + 4 ) + ( 5 + 6 )".split` `));
console.log();
console.log(ShuntingYard.simple.parse([..."f(3)"]));
console.log();