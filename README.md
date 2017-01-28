# shunt.js 
## An extensible shunting yard algorithm implemented in JavaScript  

Here's an example.

    let simple = new ShuntingYard([
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
    
    simple.parse(["3", "/", "(", "4", "+", "-", "3", ")"]);