const { join } = require("path");

const RustFmt = require("../../../src/linters/rustfmt");

const testName = "rustfmt";
const linter = RustFmt;
const commandPrefix = "";
const args = "-- --color=never";
const extensions = ["rs"];

// Linting without auto-fixing
function getLintParams(dir) {
	let localDir = dir;
	if (process.platform === "win32") {
		// See https://github.com/rust-lang/rust/issues/42869 cargo fmt will output UNC paths
		localDir = `\\\\?\\${localDir}`;
	}
	const stdoutFile1 = `Diff in ${join(
		localDir,
		"src",
		"foo.rs",
	)} at line 2:\n //!\n //!\n //! This should push the error start line down past 1\n-use std::time::{SystemTime, Duration};\n+use std::time::{Duration, SystemTime};\n \n pub fn delta() -> Duration {\n-        let start = SystemTime::now(); let delta = start.elapsed().unwrap();\n-        delta\n+    let start = SystemTime::now();\n+    let delta = start.elapsed().unwrap();\n+    delta\n }\n `;
	const stdoutFile2 = `Diff in ${join(
		localDir,
		"src",
		"main.rs",
	)} at line 1:\n mod foo;\n-fn main() {let delta = foo::delta(); println!("Time delta is {delta:?}");}\n+fn main() {\n+    let delta = foo::delta();\n+    println!("Time delta is {delta:?}");\n+}`;
	return {
		// Expected output of the linting function
		cmdOutput: {
			status: 1,
			stdout: `${stdoutFile1}\n${stdoutFile2}`,
		},
		// Expected output of the parsing function
		lintResult: {
			isSuccess: false,
			warning: [],
			error: [
				{
					path: `${join("src", "foo.rs")}`,
					firstLine: 2,
					lastLine: 2,
					message: `\n //!\n //!\n //! This should push the error start line down past 1\n-use std::time::{SystemTime, Duration};\n+use std::time::{Duration, SystemTime};\n \n pub fn delta() -> Duration {\n-        let start = SystemTime::now(); let delta = start.elapsed().unwrap();\n-        delta\n+    let start = SystemTime::now();\n+    let delta = start.elapsed().unwrap();\n+    delta\n }\n \n`,
				},
				{
					path: `${join("src", "main.rs")}`,
					firstLine: 1,
					lastLine: 1,
					message: `\n mod foo;\n-fn main() {let delta = foo::delta(); println!("Time delta is {delta:?}");}\n+fn main() {\n+    let delta = foo::delta();\n+    println!("Time delta is {delta:?}");\n+}`,
				},
			],
		},
	};
}

// Linting with auto-fixing
function getFixParams(dir) {
	return {
		// Expected output of the linting function
		cmdOutput: {
			status: 0,
		},
		// Expected output of the parsing function
		lintResult: {
			isSuccess: true,
			warning: [],
			error: [],
		},
	};
}

module.exports = [testName, linter, commandPrefix, extensions, args, getLintParams, getFixParams];
