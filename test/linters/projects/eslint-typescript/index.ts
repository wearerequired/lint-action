let var1; // "no-unused-vars" error
let var2 = "world"; // "prefer-const" warning

function main(param: string) {
	console.log("hello " + param); // "no-console" error
}

main(var2);
