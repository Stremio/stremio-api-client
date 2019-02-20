module.exports = function(a, b) {
	if (a.length !== b.length) return true;
	return a.some(function(x, i) { return b[i].transportUrl !== x.transportUrl; });
};