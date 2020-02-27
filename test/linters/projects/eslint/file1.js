let str = 'world'; // "prefer-const" warning

function main() {
	// "no-warning-comments" error
	console.log('hello ' + str); // TODO: Change something
}

main();
