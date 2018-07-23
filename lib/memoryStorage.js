function MemoryStorage() {
	var data = {};

	this.setJSON = function(key, value) {
		data[key] = JSON.stringify(value);
	};

	this.getJSON = function(key) {
		return data.hasOwnProperty(key) ? JSON.parse(data[key]) : null;
	};
}

module.exports = MemoryStorage;
