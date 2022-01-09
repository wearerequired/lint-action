// Disable logging utilities in @actions/core.
jest.mock("@actions/core", () => {
	const original = jest.requireActual("@actions/core");
	return {
		...original,
		debug: jest.fn(),
		error: jest.fn(),
		warning: jest.fn(),
		info: jest.fn(),
		startGroup: jest.fn(),
		endGroup: jest.fn(),
	};
});
