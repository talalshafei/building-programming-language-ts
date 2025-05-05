import {
	Stmt,
	Program,
	Expr,
	BinaryExpr,
	NumericLiteral,
	Identifier,
	VarDeclaration,
} from "./ast.ts";
import { tokenize, Token, TokenType } from "./lexer.ts";

export default class Parser {
	private tokens: Token[] = [];

	private at(): Token {
		return this.tokens[0];
	}

	private eat(): Token {
		return this.tokens.shift() as Token;
	}

	// deno-lint-ignore no-explicit-any
	private expect(type: TokenType, err: any): Token {
		const prev = this.eat();
		if (!prev || prev.type !== type) {
			console.error("Parser Error: \n ", err, prev, " -Expecting ", type);
		}
		return prev;
	}

	private not_eof(): boolean {
		return this.at().type != TokenType.EOF;
	}

	private parse_stmt(): Stmt {
		switch (this.at().type) {
			case TokenType.Let:
			case TokenType.Const:
				return this.parse_var_declaration();

			default:
				return this.parse_expr();
		}
	}

	// LET IDENT;
	// (LET | CONST) IDENT = EXPR;
	private parse_var_declaration(): Stmt {
		const isConstant = this.eat().type == TokenType.Const;
		const identifier = this.expect(
			TokenType.Identifier,
			"Expected identifier name following let | const keywords"
		).value;

		if (this.at().type == TokenType.Semicolon) {
			this.eat();
			if (isConstant) {
				// NOT ALLOWED
				throw "Must assign value to constant expression, No value provided.";
			}

			return {
				kind: "VarDeclaration",
				identifier: identifier,
				constant: false,
			} as VarDeclaration;
		}

		this.expect(TokenType.Equals, "Expected equals token following variable declaration");

		const declaration = {
			kind: "VarDeclaration",
			identifier: identifier,
			constant: isConstant,
			value: this.parse_expr(),
		} as VarDeclaration;

		// Force semicolon
		this.expect(TokenType.Semicolon, "Variable declaration must end with ';' ");

		return declaration;
	}

	private parse_expr(): Expr {
		return this.parse_additive_expr();
	}

	private parse_additive_expr(): Expr {
		let left = this.parse_multiplicative_expr();

		while (this.at().value === "+" || this.at().value === "-") {
			const operator = this.eat().value;
			const right = this.parse_multiplicative_expr();

			left = {
				kind: "BinaryExpr",
				left,
				right,
				operator,
			} as BinaryExpr;
		}

		return left;
	}

	private parse_multiplicative_expr(): Expr {
		let left = this.parse_primary_expr();

		while (this.at().value === "*" || this.at().value === "/" || this.at().value === "%") {
			const operator = this.eat().value;
			const right = this.parse_primary_expr();

			left = {
				kind: "BinaryExpr",
				left,
				right,
				operator,
			} as BinaryExpr;
		}

		return left;
	}

	private parse_primary_expr(): Expr {
		const tk = this.at().type;

		switch (tk) {
			case TokenType.Identifier:
				return { kind: "Identifier", symbol: this.eat().value } as Identifier;

			case TokenType.Number:
				return { kind: "NumericLiteral", value: parseFloat(this.eat().value) } as NumericLiteral;

			case TokenType.OpenParen: {
				this.eat(); // opening paren
				const value = this.parse_expr();
				this.expect(
					TokenType.CloseParen,
					"Unexpected token found inside parenthesised expression. Expected closing parenthesis."
				); // closing paren
				return value;
			}

			default:
				console.error("Unexpected token found during parsing: ", this.at());
				Deno.exit(1);
		}
	}

	public produceAST(sourceCode: string): Program {
		this.tokens = tokenize(sourceCode);
		const program: Program = {
			kind: "Program",
			body: [],
		};

		while (this.not_eof()) {
			program.body.push(this.parse_stmt());
		}

		return program;
	}
}
