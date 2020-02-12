const { run } = require("../../../src/utils/action");
const { runNpmBin } = require("../../../src/utils/npm/run-npm-bin");
const { useYarn } = require("../../../src/utils/npm/use-yarn");

const CMD = "myscript arg1 arg2";
const OPTIONS = { dir: "some-dir" };

jest.mock("../../../src/utils/action");
jest.mock("../../../src/utils/npm/use-yarn");

describe("runNpmBin()", () => {
	test("should run correct Yarn command", () => {
		useYarn.mockReturnValue(true);
		runNpmBin(CMD, OPTIONS);
		expect(run).toHaveBeenLastCalledWith(`yarn run --silent ${CMD}`, OPTIONS);
	});

	test("should run correct NPM command", () => {
		useYarn.mockReturnValue(false);
		runNpmBin(CMD, OPTIONS);
		expect(run).toHaveBeenLastCalledWith(`npx --no-install ${CMD}`, OPTIONS);
	});
});
