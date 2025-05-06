export enum TokenType {
	// Literal Types
	Number,
	Identifier,

	// Keywords
	Let,
	Const,

	// Grouping Operators
	BinaryOperator,
	Equals,
	Comma,
	Dot,
	Colon,
	Semicolon,
	OpenParen, // (
	CloseParen, // )
	OpenCurlyBrace, // {
	CloseCurlyBrace, // }
	OpenBracket, // [
	CloseBracket, // ]

	// End of File
	EOF,
}

const KEYWORDS: Record<string, TokenType> = {
	let: TokenType.Let,
	const: TokenType.Const,
};

export interface Token {
	value: string;
	type: TokenType;
}

function token(value = "", type: TokenType): Token {
	return { value, type };
}

function isalpha(src: string) {
	return src.toUpperCase() != src.toLowerCase();
}

function isint(str: string) {
	const c = str.charCodeAt(0);
	const bounds = ["0".charCodeAt(0), "9".charCodeAt(0)];
	return bounds[0] <= c && c <= bounds[1];
}

function isskippable(str: string) {
	return str == " " || str == "\n" || str == "\t" || str == "\r";
}

export function tokenize(sourceCode: string): Token[] {
	const tokens = new Array<Token>();

	const src = sourceCode.split("");

	// Build each token until end of file
	// not ver efficient but simple
	while (src.length > 0) {
		if (src[0] === "(") {
			tokens.push(token(src.shift(), TokenType.OpenParen));
		} else if (src[0] === ")") {
			tokens.push(token(src.shift(), TokenType.CloseParen));
		} else if (src[0] === "{") {
			tokens.push(token(src.shift(), TokenType.OpenCurlyBrace));
		} else if (src[0] === "}") {
			tokens.push(token(src.shift(), TokenType.CloseCurlyBrace));
		} else if (src[0] === "[") {
			tokens.push(token(src.shift(), TokenType.OpenBracket));
		} else if (src[0] === "]") {
			tokens.push(token(src.shift(), TokenType.CloseBracket));
		} else if (
			src[0] === "+" ||
			src[0] === "-" ||
			src[0] === "*" ||
			src[0] === "/" ||
			src[0] === "%"
		) {
			tokens.push(token(src.shift(), TokenType.BinaryOperator));
		} else if (src[0] === "=") {
			tokens.push(token(src.shift(), TokenType.Equals));
		} else if (src[0] === ";") {
			tokens.push(token(src.shift(), TokenType.Semicolon));
		} else if (src[0] === ":") {
			tokens.push(token(src.shift(), TokenType.Colon));
		} else if (src[0] === ",") {
			tokens.push(token(src.shift(), TokenType.Comma));
		} else if (src[0] === ".") {
			tokens.push(token(src.shift(), TokenType.Dot));
		} else {
			// Handle multi char tokens

			// Build number token
			if (isint(src[0])) {
				let num = "";
				while (src.length > 0 && isint(src[0])) {
					num += src.shift();
				}
				tokens.push(token(num, TokenType.Number));
			} else if (isalpha(src[0])) {
				let ident = "";
				while (src.length > 0 && isalpha(src[0])) {
					ident += src.shift();
				}

				// Check for reserved keyword
				const reserved = KEYWORDS[ident];
				if (typeof reserved === "number") {
					tokens.push(token(ident, reserved));
				} else {
					tokens.push(token(ident, TokenType.Identifier));
				}
			} else if (isskippable(src[0])) {
				src.shift();
			} else {
				console.error("Unrecognized character found in source: ", src[0]);
				Deno.exit(1);
			}
		}
	}

	tokens.push(token("EndOfFile", TokenType.EOF));
	return tokens;
}
