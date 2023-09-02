const commandExists = require("../../src/utils/command-exists");

describe("commandExists()", () => {
	test("should return `true` for existing command", async () => {
		if (process.platform === "win32") {
			await expect(commandExists("cmd")).resolves.toEqual(true);
		} else {
			await expect(commandExists("cat")).resolves.toEqual(true);
                }
	});

	test("should return `false` for non-existent command", async () => {
		await expect(commandExists("nonexistentcommand")).resolves.toEqual(false);
	});
});
