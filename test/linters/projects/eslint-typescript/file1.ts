let str = "world"; // "prefer-const" warning

function main(): void {
	console.log("hello " + str); // "no-console" error
}

main();
