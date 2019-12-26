const checkRunsResponse = require("./responses/check-runs.json");

const CHECK_RUNS_REGEX = /^https:\/\/api\.github\.com\/repos\/.*\/.*\/check-runs$/;

function request(url) {
	return new Promise((resolve, reject) => {
		if (CHECK_RUNS_REGEX.test(url)) {
			resolve(checkRunsResponse);
		} else {
			reject(new Error("Request error: URL matches none of the defined regular expressions"));
		}
	});
}

module.exports = request;
