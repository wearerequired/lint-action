const https = require("https");

const core = require("@actions/core");

const MAX_RETRIES = 3;
// Upper bound for a single retry wait so a large "Retry-After" cannot stall the job for a long time
const MAX_RETRY_DELAY = 60 * 1000;

/**
 * Determines whether a response indicates rate limiting that should be retried. GitHub signals its
 * primary rate limit with 429 and its secondary rate limit with 403 plus a "Retry-After" header
 * @param {import('http').IncomingMessage} res - Response
 * @returns {boolean} - Whether the request should be retried
 */
function isRateLimited(res) {
	if (res.statusCode === 429) {
		return true;
	}
	return res.statusCode === 403 && res.headers["retry-after"] != null;
}

/**
 * Helper function for making HTTP requests
 * @param {string | URL} url - Request URL
 * @param {object} options - Request options
 * @param {number} retryCount - Number of retries already attempted (used internally)
 * @returns {Promise<object>} - JSON response
 */
function request(url, options, retryCount = 0) {
	return new Promise((resolve, reject) => {
		const req = https
			.request(url, options, (res) => {
				let data = "";
				res.on("data", (chunk) => {
					data += chunk;
				});
				res.on("end", () => {
					if (isRateLimited(res) && retryCount < MAX_RETRIES) {
						// Respect the "Retry-After" header (in seconds) if present, otherwise back off
						// linearly. Cap the wait so a misbehaving header cannot stall the job
						const retryAfterHeader = parseInt(res.headers["retry-after"], 10);
						const retryAfter = Math.min(
							Number.isNaN(retryAfterHeader) ? 5000 * (retryCount + 1) : retryAfterHeader * 1000,
							MAX_RETRY_DELAY,
						);
						core.warning(
							`Request to ${url} was rate limited (status ${res.statusCode}). Retrying in ${
								retryAfter / 1000
							}s (attempt ${retryCount + 1}/${MAX_RETRIES})…`,
						);
						setTimeout(() => {
							request(url, options, retryCount + 1)
								.then(resolve)
								.catch(reject);
						}, retryAfter);
					} else if (res.statusCode >= 400) {
						const err = new Error(`Received status code ${res.statusCode}`);
						err.response = res;
						err.data = data;
						reject(err);
					} else {
						// A throw here would escape the Promise (this callback runs asynchronously), so parse
						// defensively and reject on invalid or empty JSON bodies
						try {
							resolve({ res, data: data === "" ? {} : JSON.parse(data) });
						} catch (err) {
							reject(new Error(`Could not parse response from ${url} as JSON: ${err.message}`));
						}
					}
				});
			})
			.on("error", reject);
		if (options.body) {
			req.end(JSON.stringify(options.body));
		} else {
			req.end();
		}
	});
}

module.exports = request;
