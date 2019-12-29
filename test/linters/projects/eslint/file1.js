let str = "world"; // "prefer-const" warning

function main() {
	console.log("hello " + str); // "no-console" error
}

main();
