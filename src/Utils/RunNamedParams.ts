const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
const ARGUMENT_NAMES = /([^\s,]+)/g;
function GetParamNames (func: Function) : string[] {
	const fnStr = func.toString().replace(STRIP_COMMENTS, '');
	return fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES) ?? [];
}

export default function (func: Function, namedArgs: Record<string, any>) {
	const params = GetParamNames(func);
	const argsObj = Object.fromEntries(params.map((key) => [key, namedArgs[key]]));
	const orderedArgs = params.map((param) => argsObj[param] ?? null);
	return func(...orderedArgs);
}