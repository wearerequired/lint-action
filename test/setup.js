const { mkdir } = require("fs").promises;

const { tmpDir } = require("./utils");

module.exports = async () => {
	// Create temporary directory which tests can write to
	await mkdir(tmpDir, { recursive: true });
};
