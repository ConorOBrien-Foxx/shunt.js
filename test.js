const ShuntingYard = require("./shunt.js");
const ShuntingOperator = ShuntingYard.ShuntingOperator;

ShuntingYard.simple.isFunction = (e) => e === "f";

console.log(ShuntingYard.simple.parse([..."f()"]));
console.log();
console.log(ShuntingYard.simple.parse([..."f(3)"]));
console.log();