const { EventEmitter } = require("events");
const https = require("https");

const request = require("../../src/utils/request");

jest.mock("https");

/**
 * Makes `https.request` reply with the given responses, one per request (retries included)
 * @param {Array<{statusCode: number, headers?: object, body?: string}>} responses - Responses to
 * return in order
 */
function queueResponses(responses) {
	let index = 0;
	https.request.mockImplementation((url, options, callback) => {
		const req = new EventEmitter();
		req.end = () => {
			const response = responses[index];
			index += 1;
			const res = new EventEmitter();
			res.statusCode = response.statusCode;
			res.headers = response.headers || {};
			callback(res);
			if (response.body !== undefined) {
				res.emit("data", response.body);
			}
			res.emit("end");
		};
		return req;
	});
}

describe("request()", () => {
	beforeEach(() => {
		https.request.mockReset();
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	test("parses a successful JSON response", async () => {
		queueResponses([{ statusCode: 200, body: '{"id":1}' }]);
		const { data } = await request("https://api.example", { method: "GET" });
		expect(data).toEqual({ id: 1 });
	});

	test("rejects instead of crashing on a non-JSON body", async () => {
		queueResponses([{ statusCode: 200, body: "<html>not json</html>" }]);
		await expect(request("https://api.example", {})).rejects.toThrow("Could not parse response");
	});

	test("resolves an empty body to an empty object", async () => {
		queueResponses([{ statusCode: 204, body: "" }]);
		const { data } = await request("https://api.example", {});
		expect(data).toEqual({});
	});

	test("rejects on a 4xx status code", async () => {
		queueResponses([{ statusCode: 404, body: "{}" }]);
		await expect(request("https://api.example", {})).rejects.toThrow("status code 404");
	});

	test("retries on 429 and resolves once the request succeeds", async () => {
		jest.useFakeTimers();
		queueResponses([
			{ statusCode: 429, headers: { "retry-after": "1" } },
			{ statusCode: 200, body: '{"ok":true}' },
		]);
		const promise = request("https://api.example", {});
		await jest.advanceTimersByTimeAsync(1000);
		await expect(promise).resolves.toEqual(expect.objectContaining({ data: { ok: true } }));
		expect(https.request).toHaveBeenCalledTimes(2);
	});

	test("retries a 403 that carries a Retry-After header (secondary rate limit)", async () => {
		jest.useFakeTimers();
		queueResponses([
			{ statusCode: 403, headers: { "retry-after": "1" } },
			{ statusCode: 200, body: "{}" },
		]);
		const promise = request("https://api.example", {});
		await jest.advanceTimersByTimeAsync(1000);
		await expect(promise).resolves.toEqual(expect.objectContaining({ data: {} }));
	});

	test("does not retry a 403 without a Retry-After header", async () => {
		queueResponses([{ statusCode: 403, body: "{}" }]);
		await expect(request("https://api.example", {})).rejects.toThrow("status code 403");
		expect(https.request).toHaveBeenCalledTimes(1);
	});

	test("gives up after the maximum number of retries", async () => {
		jest.useFakeTimers();
		queueResponses(Array(4).fill({ statusCode: 429, headers: { "retry-after": "1" } }));
		const promise = request("https://api.example", {});
		promise.catch(() => {}); // avoid an unhandled rejection while advancing the timers
		await jest.advanceTimersByTimeAsync(1000);
		await jest.advanceTimersByTimeAsync(1000);
		await jest.advanceTimersByTimeAsync(1000);
		await expect(promise).rejects.toThrow("status code 429");
		expect(https.request).toHaveBeenCalledTimes(4);
	});
});
