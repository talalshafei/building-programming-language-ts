import Parser from "./frontend/parser.ts";
import { NewGlobalEnv } from "./runtime/environment.ts";
import { evaluate } from "./runtime/interpreter.ts";

main();

async function main() {
	if (Deno.args.length < 1) {
		console.error("Usage: deno run -A main.ts <filename>");
		Deno.exit(1);
	}

	const filename = Deno.args[0];
	const parser = new Parser();
	const env = NewGlobalEnv();

	const input = await Deno.readTextFile(filename);
	const program = parser.produceAST(input);
	evaluate(program, env);
}

// run("./test.txt");

// async function run(filename: string) {
// 	const parser = new Parser();
// 	const env = NewGlobalEnv();

// 	const input = await Deno.readTextFile(filename);
// 	const program = parser.produceAST(input);
// 	evaluate(program, env);
// }

// repl();
/*
// for interactive testing
function repl() {
	const parser = new Parser();
	const env = new Environment();

	while (true) {
		const input = prompt("> ");

		if (!input || input.includes("exit")) {
			Deno.exit(1);
		}

		const program = parser.produceAST(input);

		const result = evaluate(program, env);
		console.log(result);
	}
}
*/
