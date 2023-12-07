const https = require("https");

/**
 * Helper function for making HTTP requests
 * @param {string | URL} url - Request URL
 * @param {object} options - Request options
 * @param {number} retryCount - Current attempted number of retries
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
					if (res.statusCode === 429) {
						if (retryCount < 3) {
							// max retries
							const retryAfter = res.headers["retry-after"]
								? parseInt(res.headers["retry-after"], 10) * 1000
								: 5000 * retryCount; // default backoff time if 'retry-after' header is not present
							setTimeout(() => {
								request(url, options, retryCount + 1)
									.then(resolve)
									.catch(reject);
							}, retryAfter);
						} else {
							reject(new Error(`Max retries reached. Status code: ${res.statusCode}`));
						}
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
