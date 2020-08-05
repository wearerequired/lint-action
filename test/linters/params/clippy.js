const Clippy = require("../../../src/linters/clippy");

const testName = "clippy";
const linter = Clippy;
const extensions = ["rs"];

// Linting without auto-fixing
function getLintParams(dir) {
	const srcPath = "/src/main.rs";
	const rmeta = "/target/debug/deps/liblint-d12ea75e4c06d965.rmeta";
	if (dir.includes("\\")) {
		// Running under windows filesystem
		const oneBackSlash = /\\/gi;
		dir.replace(oneBackSlash, "\\\\");
		const oneSlash = /\//gi;
		srcPath.replace(oneSlash, "\\\\");
	}
	return {
		// Expected output of the linting function
		cmdOutput: {
			status: 0,
			stdout:
				`{"reason":"compiler-message","package_id":"lint 0.0.1 (path+file://${dir})","target":{"kind":["bin"],"crate_types":["bin"],"name":"lint","src_path":"${dir}${srcPath}","edition":"2018","doctest":false},"message":{"rendered":"warning: function \`sayHi\` should have a snake case name\\n --> src/file1.rs:1:8\\n  |\\n1 | pub fn sayHi(name: &str) {\\n  |        ^^^^^ help: convert the identifier to snake case: \`say_hi\`\\n  |\\n  = note: \`#[warn(non_snake_case)]\` on by default\\n\\n","children":[{"children":[],"code":null,"level":"note","message":"\`#[warn(non_snake_case)]\` on by default","rendered":null,"spans":[]},{"children":[],"code":null,"level":"help","message":"convert the identifier to snake case","rendered":null,"spans":[{"byte_end":12,"byte_start":7,"column_end":13,"column_start":8,"expansion":null,"file_name":"src/file1.rs","is_primary":true,"label":null,"line_end":1,"line_start":1,"suggested_replacement":"say_hi","suggestion_applicability":"MaybeIncorrect","text":[{"highlight_end":13,"highlight_start":8,"text":"pub fn sayHi(name: &str) {"}]}]}],"code":{"code":"non_snake_case","explanation":null},"level":"warning","message":"function \`sayHi\` should have a snake case name","spans":[{"byte_end":12,"byte_start":7,"column_end":13,"column_start":8,"expansion":null,"file_name":"src/file1.rs","is_primary":true,"label":null,"line_end":1,"line_start":1,"suggested_replacement":null,"suggestion_applicability":null,"text":[{"highlight_end":13,"highlight_start":8,"text":"pub fn sayHi(name: &str) {"}]}]}}\n` +
				`{"reason":"compiler-message","package_id":"lint 0.0.1 (path+file://${dir})","target":{"kind":["bin"],"crate_types":["bin"],"name":"lint","src_path":"${dir}${srcPath}","edition":"2018","doctest":false},"message":{"rendered":"warning: 1 warning emitted\\n\\n","children":[],"code":null,"level":"warning","message":"1 warning emitted","spans":[]}}\n` +
				`{"reason":"compiler-artifact","package_id":"lint 0.0.1 (path+file://${dir})","target":{"kind":["bin"],"crate_types":["bin"],"name":"lint","src_path":"${dir}${srcPath}","edition":"2018","doctest":false},"profile":{"opt_level":"0","debuginfo":2,"debug_assertions":true,"overflow_checks":true,"test":false},"features":[],"filenames":["${dir}${rmeta}"],"executable":"${dir}${rmeta}","fresh":true}\n` +
				`{"reason":"build-finished","success":true}`,
		},
		// Expected output of the parsing function
		lintResult: {
			isSuccess: true,
			warning: [
				{
					path: "src/file1.rs",
					firstLine: 1,
					lastLine: 1,
					message: "function `sayHi` should have a snake case name",
				},
			],
			error: [],
		},
	};
}

// Linting with auto-fixing
function getFixParams(dir) {
	const srcPath = "/src/main.rs";
	const rmeta = "/target/debug/deps/liblint-d12ea75e4c06d965.rmeta";
	if (dir.includes("\\")) {
		// Running under windows filesystem
		const oneBackSlash = /\\/gi;
		dir.replace(oneBackSlash, "\\\\");
		const oneSlash = /\//gi;
		srcPath.replace(oneSlash, "\\\\");
	}
	return {
		// Expected output of the linting function
		cmdOutput: {
			status: 0,
			stdout:
				`{"reason":"compiler-message","package_id":"lint 0.0.1 (path+file://${dir})","target":{"kind":["bin"],"crate_types":["bin"],"name":"lint","src_path":"${dir}${srcPath}","edition":"2018","doctest":false},"message":{"rendered":"warning: function \`sayHi\` should have a snake case name\\n --> src/file1.rs:1:8\\n  |\\n1 | pub fn sayHi(name: &str) {\\n  |        ^^^^^ help: convert the identifier to snake case: \`say_hi\`\\n  |\\n  = note: \`#[warn(non_snake_case)]\` on by default\\n\\n","children":[{"children":[],"code":null,"level":"note","message":"\`#[warn(non_snake_case)]\` on by default","rendered":null,"spans":[]},{"children":[],"code":null,"level":"help","message":"convert the identifier to snake case","rendered":null,"spans":[{"byte_end":12,"byte_start":7,"column_end":13,"column_start":8,"expansion":null,"file_name":"src/file1.rs","is_primary":true,"label":null,"line_end":1,"line_start":1,"suggested_replacement":"say_hi","suggestion_applicability":"MaybeIncorrect","text":[{"highlight_end":13,"highlight_start":8,"text":"pub fn sayHi(name: &str) {"}]}]}],"code":{"code":"non_snake_case","explanation":null},"level":"warning","message":"function \`sayHi\` should have a snake case name","spans":[{"byte_end":12,"byte_start":7,"column_end":13,"column_start":8,"expansion":null,"file_name":"src/file1.rs","is_primary":true,"label":null,"line_end":1,"line_start":1,"suggested_replacement":null,"suggestion_applicability":null,"text":[{"highlight_end":13,"highlight_start":8,"text":"pub fn sayHi(name: &str) {"}]}]}}\n` +
				`{"reason":"compiler-message","package_id":"lint 0.0.1 (path+file://${dir})","target":{"kind":["bin"],"crate_types":["bin"],"name":"lint","src_path":"${dir}${srcPath}","edition":"2018","doctest":false},"message":{"rendered":"warning: 1 warning emitted\\n\\n","children":[],"code":null,"level":"warning","message":"1 warning emitted","spans":[]}}\n` +
				`{"reason":"compiler-artifact","package_id":"lint 0.0.1 (path+file://${dir})","target":{"kind":["bin"],"crate_types":["bin"],"name":"lint","src_path":"${dir}${srcPath}","edition":"2018","doctest":false},"profile":{"opt_level":"0","debuginfo":2,"debug_assertions":true,"overflow_checks":true,"test":false},"features":[],"filenames":["${dir}${rmeta}"],"executable":"${dir}${rmeta}","fresh":true}\n` +
				`{"reason":"build-finished","success":true}`,
		},
		// Expected output of the parsing function
		lintResult: {
			isSuccess: true,
			warning: [
				{
					path: "src/file1.rs",
					firstLine: 1,
					lastLine: 1,
					message: "function `sayHi` should have a snake case name",
				},
			],
			error: [],
		},
	};
}

module.exports = [testName, linter, extensions, getLintParams, getFixParams];
