const { getCommandPrefix, getNpmPrefix } = require("../../src/utils/command-prefix");
const { useYarn } = require("../../src/utils/npm/use-yarn");

const LINTER = "myscript";
const DIR = "some-dir";

jest.mock("../../src/utils/action");
jest.mock("../../src/utils/npm/use-yarn");
jest.mock("../../src/utils/command-prefix", () => ({
	...jest.genMockFromModule("../../src/utils/command-prefix"),
	getNpmPrefix: jest.requireActual("../../src/utils/command-prefix").getNpmPrefix,
}));

describe("getNpmPrefix()", () => {
	test("should return correct Yarn command", () => {
		getCommandPrefix.mockReturnValue("");
		useYarn.mockReturnValue(true);
		expect(getNpmPrefix(LINTER, DIR)).toEqual("yarn run --silent ");
	});

	test("should return correct NPM command", () => {
		getCommandPrefix.mockReturnValue("");
		useYarn.mockReturnValue(false);
		expect(getNpmPrefix(LINTER, DIR)).toEqual("npx --no-install ");
	});

	test("should return user-provided prefix", () => {
		getCommandPrefix.mockReturnValue("some prefix");
		expect(getNpmPrefix(LINTER, DIR)).toEqual("some prefix");
	});
});
