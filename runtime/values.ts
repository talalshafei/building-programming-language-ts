import { Stmt } from "../frontend/ast.ts";
import Environment from "./environment.ts";

export type ValueType = "null" | "number" | "boolean" | "object" | "native-fn" | "function";

export interface RuntimeVal {
	type: ValueType;
}

export interface NullVal extends RuntimeVal {
	type: "null";
	value: null;
}

export interface NumberVal extends RuntimeVal {
	type: "number";
	value: number;
}

export interface BooleanVal extends RuntimeVal {
	type: "boolean";
	value: boolean;
}

export interface ObjectVal extends RuntimeVal {
	type: "object";
	properties: Map<string, RuntimeVal>;
}

export type FunctionCall = (args: RuntimeVal[], env: Environment) => RuntimeVal;
export interface NativeFnValue extends RuntimeVal {
	type: "native-fn";
	call: FunctionCall;
}

export interface FunctionVal extends RuntimeVal {
	type: "function";
	name: string;
	parameters: string[];
	declarationEnv: Environment;
	body: Stmt[];
}

export function MK_NUMBER(n = 0): NumberVal {
	return { type: "number", value: n } as NumberVal;
}

export function MK_NULL(): NullVal {
	return { type: "null", value: null } as NullVal;
}

export function MK_BOOL(t = false): BooleanVal {
	return { type: "boolean", value: t } as BooleanVal;
}

export function MK_NATIVE_FN(call: FunctionCall) {
	return { type: "native-fn", call } as NativeFnValue;
}
