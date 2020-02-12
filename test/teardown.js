const { remove } = require("fs-extra");

const { tmpDir } = require("./test-utils");

module.exports = async () => {
	// Remove temporary directory
	await remove(tmpDir);
};
