const { remove } = require("fs-extra");

const { tmpDir } = require("./utils");

module.exports = async () => {
	// Remove temporary directory
	await remove(tmpDir);
};
