// It's not very efficient but can prevent against timing attacks
export default function SecureStringTest(x: string, y: string) {
	const max = Math.max(x.length, y.length)
	let match = true;
	for (let i = 0; i < max; i++) {
		if (x[i] !== y[i]) {
			match = false;
		}
	}
	return match;
}
