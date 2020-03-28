const { getNpmBinCommand } = require("../../../src/utils/npm/get-npm-bin-command");
const { useYarn } = require("../../../src/utils/npm/use-yarn");

jest.mock("../../../src/utils/action");
jest.mock("../../../src/utils/npm/use-yarn");

describe("runNpmBin()", () => {
	test("should run correct Yarn command", () => {
		useYarn.mockReturnValue(true);
		const npmBinCommand = getNpmBinCommand("/this/path/is/not/used");
		expect(npmBinCommand).toEqual("yarn run --silent");
	});

	test("should run correct NPM command", () => {
		useYarn.mockReturnValue(false);
		const npmBinCommand = getNpmBinCommand("/this/path/is/not/used");
		expect(npmBinCommand).toEqual("npx --no-install");
	});
});
