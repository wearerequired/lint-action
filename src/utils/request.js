const https = require("https");

const MAX_RETRIES = 3;

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
					if (res.statusCode === 429 && retryCount < MAX_RETRIES) {
						// Too many requests: respect the "Retry-After" header if present, otherwise back off
						// linearly
						const retryAfterHeader = parseInt(res.headers["retry-after"], 10);
						const retryAfter = Number.isNaN(retryAfterHeader)
							? 5000 * (retryCount + 1)
							: retryAfterHeader * 1000;
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
						resolve({ res, data: JSON.parse(data) });
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
