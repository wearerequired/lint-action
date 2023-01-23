const { join } = require("path");

const Clippy = require("../../../src/linters/clippy");
const { joinDoubleBackslash } = require("../../test-utils");

const testName = "clippy";
const linter = Clippy;
const args = "--allow-dirty";
const commandPrefix = "";
const extensions = ["rs"];

// Linting without auto-fixing
function getLintParams(dir) {
	const srcPath = join("src", "main.rs");
	const file1 = joinDoubleBackslash("src", "file1.rs");

	// Not the liblint hash changes based on tooling and what not, so we rely on
	// stdoutParts to make the tests stable across machines
	const rmeta = join("target", "debug", "deps", "liblint-5522172e953d5996.rmeta");

	let pathFile = dir;
	if (process.platform === "win32") {
		pathFile = `/${dir.replace(/\\/g, "/")}`;
	}

	const stderrPart1 = `{"reason":"compiler-message","package_id":"lint 0.0.1 (path+file://${pathFile})","manifest_path":"${joinDoubleBackslash(
		dir,
		"Cargo.toml",
	)}","target":{"kind":["bin"],"crate_types":["bin"],"name":"lint","src_path":"${joinDoubleBackslash(
		dir,
		srcPath,
	)}","edition":"2021","doc":true,"doctest":false,"test":true},"message":{"rendered":"warning: function \`sayHi\` should have a snake case name\\n --> ${file1}:1:8\\n  |\\n1 | pub fn sayHi(name: &str) {\\n  |        ^^^^^ help: convert the identifier to snake case: \`say_hi\`\\n  |\\n  = note: \`#[warn(non_snake_case)]\` on by default\\n\\n","children":[{"children":[],"code":null,"level":"note","message":"\`#[warn(non_snake_case)]\` on by default","rendered":null,"spans":[]},{"children":[],"code":null,"level":"help","message":"convert the identifier to snake case","rendered":null,"spans":[{"byte_end":12,"byte_start":7,"column_end":13,"column_start":8,"expansion":null,"file_name":"${file1}","is_primary":true,"label":null,"line_end":1,"line_start":1,"suggested_replacement":"say_hi","suggestion_applicability":"MaybeIncorrect","text":[{"highlight_end":13,"highlight_start":8,"text":"pub fn sayHi(name: &str) {"}]}]}],"code":{"code":"non_snake_case","explanation":null},"level":"warning","message":"function \`sayHi\` should have a snake case name","spans":[{"byte_end":12,"byte_start":7,"column_end":13,"column_start":8,"expansion":null,"file_name":"${file1}","is_primary":true,"label":null,"line_end":1,"line_start":1,"suggested_replacement":null,"suggestion_applicability":null,"text":[{"highlight_end":13,"highlight_start":8,"text":"pub fn sayHi(name: &str) {"}]}]}}\n`;
	const stderrPart2 = `{"reason":"compiler-message","package_id":"lint 0.0.1 (path+file://${pathFile})","manifest_path":"${joinDoubleBackslash(
		dir,
		"Cargo.toml",
	)}","target":{"kind":["bin"],"crate_types":["bin"],"name":"lint","src_path":"${joinDoubleBackslash(
		dir,
		srcPath,
	)}","edition":"2021","doc":true,"doctest":false,"test":true},"message":{"rendered":"warning: 1 warning emitted\\n\\n","children":[],"code":null,"level":"warning","message":"1 warning emitted","spans":[]}}\n`;
	const stderrPart3 = `{"reason":"compiler-artifact","package_id":"lint 0.0.1 (path+file://${dir})","manifest_path":"${join(
		dir,
		"Cargo.toml",
	)}","target":{"kind":["bin"],"crate_types":["bin"],"name":"lint","src_path":"${join(
		dir,
		srcPath,
	)}","edition":"2021","doc":true,"doctest":false,"test":true},"profile":{"opt_level":"0","debuginfo":2,"debug_assertions":true,"overflow_checks":true,"test":false},"features":[],"filenames":["${join(
		dir,
		rmeta,
	)}"],"executable":null,"fresh":false}\n`;
	const stderrPart4 = `{"reason":"build-finished","success":true}`;
	return {
		// Expected output of the linting function
		cmdOutput: {
			status: 0,
			stdoutParts: [stderrPart1, stderrPart2],
			stdout: `${stderrPart1}${stderrPart2}${stderrPart3}${stderrPart4}`,
		},
		// Expected output of the parsing function
		lintResult: {
			isSuccess: false,
			warning: [
				{
					path: joinDoubleBackslash("src", "file1.rs"),
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
	const srcPath = join("src", "main.rs");
	const file1 = joinDoubleBackslash("src", "file1.rs");

	// Not the liblint hash changes based on tooling and what not, so we rely on
	// stdoutParts to make the tests stable across machines
	const rmeta = join("target", "debug", "deps", "liblint-5522172e953d5996.rmeta");

	let pathFile = dir;
	if (process.platform === "win32") {
		pathFile = `/${dir.replace(/\\/g, "/")}`;
	}

	const stderrPart1 = `{"reason":"compiler-message","package_id":"lint 0.0.1 (path+file://${pathFile})","manifest_path":"${joinDoubleBackslash(
		dir,
		"Cargo.toml",
	)}","target":{"kind":["bin"],"crate_types":["bin"],"name":"lint","src_path":"${joinDoubleBackslash(
		dir,
		srcPath,
	)}","edition":"2021","doc":true,"doctest":false,"test":true},"message":{"rendered":"warning: function \`sayHi\` should have a snake case name\\n --> ${file1}:1:8\\n  |\\n1 | pub fn sayHi(name: &str) {\\n  |        ^^^^^ help: convert the identifier to snake case: \`say_hi\`\\n  |\\n  = note: \`#[warn(non_snake_case)]\` on by default\\n\\n","children":[{"children":[],"code":null,"level":"note","message":"\`#[warn(non_snake_case)]\` on by default","rendered":null,"spans":[]},{"children":[],"code":null,"level":"help","message":"convert the identifier to snake case","rendered":null,"spans":[{"byte_end":12,"byte_start":7,"column_end":13,"column_start":8,"expansion":null,"file_name":"${file1}","is_primary":true,"label":null,"line_end":1,"line_start":1,"suggested_replacement":"say_hi","suggestion_applicability":"MaybeIncorrect","text":[{"highlight_end":13,"highlight_start":8,"text":"pub fn sayHi(name: &str) {"}]}]}],"code":{"code":"non_snake_case","explanation":null},"level":"warning","message":"function \`sayHi\` should have a snake case name","spans":[{"byte_end":12,"byte_start":7,"column_end":13,"column_start":8,"expansion":null,"file_name":"${file1}","is_primary":true,"label":null,"line_end":1,"line_start":1,"suggested_replacement":null,"suggestion_applicability":null,"text":[{"highlight_end":13,"highlight_start":8,"text":"pub fn sayHi(name: &str) {"}]}]}}\n`;
	const stderrPart2 = `{"reason":"compiler-message","package_id":"lint 0.0.1 (path+file://${pathFile})","manifest_path":"${joinDoubleBackslash(
		dir,
		"Cargo.toml",
	)}","target":{"kind":["bin"],"crate_types":["bin"],"name":"lint","src_path":"${joinDoubleBackslash(
		dir,
		srcPath,
	)}","edition":"2021","doc":true,"doctest":false,"test":true},"message":{"rendered":"warning: 1 warning emitted\\n\\n","children":[],"code":null,"level":"warning","message":"1 warning emitted","spans":[]}}\n`;
	const stderrPart3 = `{"reason":"compiler-artifact","package_id":"lint 0.0.1 (path+file://${dir})","manifest_path":"${join(
		dir,
		"Cargo.toml",
	)}","target":{"kind":["bin"],"crate_types":["bin"],"name":"lint","src_path":"${join(
		dir,
		srcPath,
	)}","edition":"2021","doc":true,"doctest":false,"test":true},"profile":{"opt_level":"0","debuginfo":2,"debug_assertions":true,"overflow_checks":true,"test":false},"features":[],"filenames":["${join(
		dir,
		rmeta,
	)}"],"executable":null,"fresh":false}\n`;
	const stderrPart4 = `{"reason":"build-finished","success":true}`;
	return {
		// Expected output of the linting function
		cmdOutput: {
			status: 0,
			stdoutParts: [stderrPart1, stderrPart2],
			stdout: `${stderrPart1}${stderrPart2}${stderrPart3}${stderrPart1}${stderrPart2}${stderrPart3}${stderrPart4}`,
		},
		// Expected output of the parsing function
		lintResult: {
			isSuccess: false,
			warning: [
				{
					path: joinDoubleBackslash("src", "file1.rs"),
					firstLine: 1,
					lastLine: 1,
					message: "function `sayHi` should have a snake case name",
				},
				{
					path: joinDoubleBackslash("src", "file1.rs"),
					firstLine: 1,
					lastLine: 1,
					message: "function `sayHi` should have a snake case name",
				},
			],
			error: [],
		},
	};
}

module.exports = [testName, linter, commandPrefix, extensions, args, getLintParams, getFixParams];
