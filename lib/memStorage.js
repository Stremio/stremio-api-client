function memStorage() {
	var map = {};

	this.setJSON = function(k, v) {
		map[k] = JSON.stringify(v);
	};

	this.getJSON = function(k) {
		return map.hasOwnProperty(k) ? JSON.parse(map[k]) : null;
	};

	return this;
}

module.exports = memStorage