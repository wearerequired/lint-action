let var1; // "no-unused-vars" error
let var2 = "world"; // "prefer-const" warning

function main() {
	console.log("hello " + var2); // "no-console" error
}

main();
