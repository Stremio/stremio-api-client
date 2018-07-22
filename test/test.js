var StremioAPI = require('..')
var tape = require('tape')

var api = new StremioAPI()

tape('basic version call', function(t) {
	// @TODO: test addonCollectionGet
	api.request('addonQueue', {})
	.then(function(resp) {
		t.ok(resp, 'has response')
		t.end()
	})
})