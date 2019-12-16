/**
 * Capitalizes the first letter of a string
 *
 * @param str {string}: String to process
 * @returns {string}: Input string with first letter capitalized
 */
function capitalizeFirstLetter(str) {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

module.exports = {
	capitalizeFirstLetter,
};
