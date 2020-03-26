const { useYarn } = require("../../src/utils/npm/use-yarn");
const { npmPrefix, getCommandPrefix } = require("../../src/utils/prefix");

const LINTER = "myscript";
const DIR = "some-dir";

jest.mock("../../src/utils/action");
jest.mock("../../src/utils/npm/use-yarn");
jest.mock("../../src/utils/prefix", () => ({
  ...jest.genMockFromModule("../../src/utils/prefix"),
  npmPrefix: jest.requireActual("../../src/utils/prefix").npmPrefix
}));

describe("npmPrefix()", () => {
	test("should return correct Yarn command", () => {
		getCommandPrefix.mockReturnValue("");
		useYarn.mockReturnValue(true);
		expect(npmPrefix(LINTER, DIR)).toEqual("yarn run --silent ");
	});

	test("should run correct NPM command", () => {
		getCommandPrefix.mockReturnValue("");
		useYarn.mockReturnValue(false);
		expect(npmPrefix(LINTER, DIR)).toEqual("npx --no-install ");
	});

	test("should run existing prefix", () => {
		getCommandPrefix.mockReturnValue("some prefix");
		expect(npmPrefix(LINTER, DIR)).toEqual("some prefix");
	})
});
