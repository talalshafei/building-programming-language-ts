import {
	AssignmentExpr,
	BinaryExpr,
	CallExpr,
	Identifier,
	ObjectLiteral,
} from "../../frontend/ast.ts";
import Environment from "../environment.ts";
import { evaluate } from "../interpreter.ts";
import {
	NumberVal,
	MK_NUMBER,
	RuntimeVal,
	MK_NULL,
	ObjectVal,
	NativeFnValue,
	FunctionVal,
} from "../values.ts";

function eval_numeric_binary_expr(lhs: NumberVal, rhs: NumberVal, operator: string): NumberVal {
	let result = 0;
	if (operator == "+") {
		result = lhs.value + rhs.value;
	} else if (operator == "-") {
		result = lhs.value - rhs.value;
	} else if (operator == "*") {
		result = lhs.value * rhs.value;
	} else if (operator == "/") {
		// TODO: Division by zero check
		result = lhs.value / rhs.value;
	} else {
		result = lhs.value % rhs.value;
	}

	return MK_NUMBER(result);
}

export function eval_binary_expr(binop: BinaryExpr, env: Environment): RuntimeVal {
	const lhs = evaluate(binop.left, env);
	const rhs = evaluate(binop.right, env);

	if (lhs.type == "number" && rhs.type == "number") {
		return eval_numeric_binary_expr(lhs as NumberVal, rhs as NumberVal, binop.operator);
	}

	// One or both NULL
	return MK_NULL();
}

export function eval_identifier(ident: Identifier, env: Environment): RuntimeVal {
	const val = env.lookupVar(ident.symbol);
	return val;
}

export function eval_assignment(node: AssignmentExpr, env: Environment): RuntimeVal {
	if (node.assignee.kind !== "Identifier")
		throw `Invalid LHS for the assignment expression ${JSON.stringify(node.assignee)}`;

	const varname = (node.assignee as Identifier).symbol;
	return env.assignVar(varname, evaluate(node.value, env));
}

export function eval_object_expr(obj: ObjectLiteral, env: Environment): RuntimeVal {
	const object = { type: "object", properties: new Map() } as ObjectVal;

	for (const { key, value } of obj.properties) {
		// Handles key:val pair
		const runtimeVal = value === undefined ? env.lookupVar(key) : evaluate(value, env);
		object.properties.set(key, runtimeVal);
	}
	return object;
}

export function eval_call_expr(expr: CallExpr, env: Environment): RuntimeVal {
	const args = expr.args.map((arg) => evaluate(arg, env));
	const fn = evaluate(expr.caller, env);
	if (fn.type === "native-fn") {
		return (fn as NativeFnValue).call(args, env);
	} else if (fn.type === "function") {
		const func = fn as FunctionVal;
		const paramsSize = func.parameters.length;

		if (args.length != paramsSize)
			throw `Arguments number doesn't equal the expected number of parameters for function: ${func.name}. `;

		const scope = new Environment(func.declarationEnv);

		for (let i = 0; i < paramsSize; i++) {
			const varname = func.parameters[i];
			scope.declareVar(varname, args[i], false);
		}

		let result: RuntimeVal = MK_NULL();
		for (const stmt of func.body) {
			result = evaluate(stmt, scope);
		}

		return result;
	}

	throw `Cannot call value that is not a function: ` + JSON.stringify(fn);
}
