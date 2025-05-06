# Minimal Interpreter using TS

A lightweight programming language interpreter built with TypeScript and Deno. This project implements a custom programming language with lexing, parsing, and interpretation phases.

## Features

- Variable declarations with `let` and `const`
- Function declarations with `fn` keyword
- First-class functions and closures
- Basic arithmetic operations (`+`, `-`, `*`, `/`, `%`)
- Object literals and property access
- Built-in functions (`print`, `time`)
- Inline comments with `#`

## Requirements

- [Deno](https://deno.land/) runtime

## Usage

Run a program from a file:

```bash
deno run -A main.ts path/to/file.txt
```

## Example Program

Save this to a file and run it to test all language features:

```
# Variable declarations
let x = 10;
const y = 20;
print(x + y)  # 30
print() # empty print to print new line


# Arithmetic operations
print(10 * 5)  # 50
print(20 / 4)  # 5
print(10 % 3)  # 1
print()


# Object literals
let person = {
    age: 30,
    isActive: true
};
print(person)
print()


# Basic function
fn add(a, b) {
    a + b
}
print(add(5, 10))  # 15
print()


# Closures and higher-order functions
fn makeCounter(start) {
    let count = start;
    
    fn increment() {
        count = count + 1
        count
    }
    
    increment
}

# Create two separate counters
const counterX = makeCounter(0);
const counterY = makeCounter(10);

print(counterX())  # 1
print(counterX())  # 2
print(counterY())  # 11
print()

# Built-in
print(time())  # Current timestamp
print(true)
print(false)
print(null)
print()


```

## Language Syntax

### Variables

```
# note only in variable & object declarations ';' is required

let x;           # Variable declaration (initialized to null)
let y = 10;      # Variable with initialization
const z = 20;    # Constant (must be initialized)
```

### Functions

```
fn add(a, b) {
    a + b        # Implicit return of last expression
}

const result = add(5, 10)
```

### Objects

```
let person = {
    name: "John",
    age: 30
};
```

## Project Structure

- **frontend/** - Lexical analysis and syntax parsing
  - lexer.ts - Tokenizes source code into tokens
  - parser.ts - Builds AST from tokens
  - ast.ts - AST node type definitions
- **runtime/** - Interpreter and runtime environment
  - interpreter.ts - Main evaluation logic
  - environment.ts - Variable scope management
  - values.ts - Runtime value type definitions
  - **eval/**
    - expressions.ts - Expression evaluation
    - statements.ts - Statement evaluation

## Architecture

The interpreter follows a classic design pattern:

1. **Lexing**: Source code is tokenized by the `tokenize` function
2. **Parsing**: Tokens are assembled into an AST by the `Parser` class
3. **Interpretation**: The AST is evaluated by the `evaluate` function

The environment model maintains variable scopes, with a global environment containing built-in functions and values. Function closures capture their declaration environment, enabling proper lexical scoping.

## Extending the Language

To add new features to the language:

1. Add new token types in lexer.ts if needed
2. Add corresponding AST node types in ast.ts
3. Update the parser in parser.ts to handle the new syntax
4. Add evaluation logic in interpreter.ts or the specialized evaluators

## Future Improvements
This is still the beginning 

- Add string data type
- Add control flow statements (if/else, loops)
- Support for arrays and array operations
- Implement error handling and better error messages
- Add module system for code organization

## License

MIT