import { AssignmentExpr, BinaryExpr, Identifier, ObjectLiteral } from "../../frontend/ast.ts";
import Environment from "../environment.ts";
import { evaluate } from "../interpreter.ts";
import { NumberVal, MK_NUMBER, RuntimeVal, MK_NULL, ObjectVal } from "../values.ts";

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
