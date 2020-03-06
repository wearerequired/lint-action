const { npmPrefix } = require("../../../src/utils/npm/npm-prefix");
const { useYarn } = require("../../../src/utils/npm/use-yarn");
const { prefix } = require("../../../src/utils/prefix");

const LINTER = "myscript";
const DIR = "some-dir";

jest.mock("../../../src/utils/action");
jest.mock("../../../src/utils/npm/use-yarn");
jest.mock("../../../src/utils/prefix");

describe("npmPrefix()", () => {
	test("should return correct Yarn command", () => {
		useYarn.mockReturnValue(true);
		expect(npmPrefix(LINTER, DIR)).toEqual("yarn run --silent ");
	});

	test("should run correct NPM command", () => {
		useYarn.mockReturnValue(false);
		expect(npmPrefix(LINTER, DIR)).toEqual("npx --no-install ");
	});

	test("should run existing prefix", () => {
		prefix.mockReturnValue("some prefix");
		expect(npmPrefix(LINTER, DIR)).toEqual("some prefix");
	})
});
