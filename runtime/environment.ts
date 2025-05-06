import { MK_BOOL, MK_NATIVE_FN, MK_NULL, MK_NUMBER, RuntimeVal } from "./values.ts";

export function NewGlobalEnv(): Environment {
	const env = new Environment();
	// Create Defaults
	env.declareVar("true", MK_BOOL(true), true);
	env.declareVar("false", MK_BOOL(false), true);
	env.declareVar("null", MK_NULL(), true);

	// Define builtin functions
	env.declareVar(
		"print",
		MK_NATIVE_FN((args, _scope) => {
			console.log(...args);
			return MK_NULL();
		}),
		true
	);

	function timeFunction(_args: RuntimeVal[], _scope: Environment) {
		return MK_NUMBER(Date.now());
	}
	env.declareVar("time", MK_NATIVE_FN(timeFunction), true);

	return env;
}

export default class Environment {
	private parent?: Environment;

	private variables: Map<string, RuntimeVal>;
	private constants: Set<string>;

	constructor(parentENV?: Environment) {
		this.parent = parentENV;
		this.variables = new Map();
		this.constants = new Set();
	}

	public declareVar(varname: string, value: RuntimeVal, constant: boolean): RuntimeVal {
		if (this.variables.has(varname)) {
			throw `Cannot declare variable ${varname}. As it is already defined.`;
		}

		this.variables.set(varname, value);
		if (constant) {
			this.constants.add(varname);
		}

		return value;
	}

	public assignVar(varname: string, value: RuntimeVal): RuntimeVal {
		const env = this.resolve(varname);
		if (env.constants.has(varname)) {
			throw `Cannot reassign to variable ${varname} as it was declared as constant.`;
		}

		env.variables.set(varname, value);
		return value;
	}

	public resolve(varname: string): Environment {
		if (this.variables.has(varname)) {
			return this;
		}
		if (this.parent == undefined) {
			throw `Cannot resolve "${varname}" as it doesn't exist`;
		}

		return this.parent.resolve(varname);
	}

	public lookupVar(varname: string): RuntimeVal {
		const env = this.resolve(varname);
		return env.variables.get(varname) as RuntimeVal;
	}
}
