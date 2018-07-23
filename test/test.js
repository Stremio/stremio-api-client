var StremioAPIStore = require('..').StremioAPIStore
var tape = require('tape')
var MemoryStorage = require('../lib/memoryStorage')

var api = new StremioAPIStore()

// @TODO: test StremioAPIClient too

tape('basic call', function(t) {
	api.request('addonCollectionGet', {})
	.then(function(resp) {
		t.ok(resp, 'has response')
		t.ok(Array.isArray(resp.addons), 'response is valid')
		t.ok(resp.isInitial, 'response isInitial')
		t.end()
	})
	.catch(function(err) {
		t.error(err)
	})
})


var user = {
	email: 'stremioapiclient+'+Date.now()+'@strem.io',
	password: '215552'+Date.now(),
}

tape('register', function(t) {
	api.register(user.email, user.password)
	.then(function(resp) {
		t.ok(api.user, 'api.user')
		t.equals(api.user.email, user.email,  'user email is equal')
		t.end()
	})
	.catch(function(err) {
		t.error(err)
	})
})

/*
tape('getAddonCollection', function(t) {
	t.ok(api.addons, 'api.addons is there')

	api.getAddonCollection()
	.then(function(resp) {
		t.ok(resp.isInitial, 'isInitial')
		t.ok(api.addons, 'api.addons is there')
		t.end()
	})
})
*/

tape('logout', function(t) {
	api.logout()
	.then(function() {
		t.notOk(api.user, 'api.user should be empty')
		t.end()
	})
	.catch(function(err) {
		t.error(err)
	})
})

tape('storage persists', function(t) {
	var user = {
		email: 'stremioapiclient2+'+Date.now()+'@strem.io',
		password: '215552'+Date.now(),
	}

	var store = new MemoryStorage()
	var API = new StremioAPIStore({ storage: store })
	API.register(user.email, user.password)
	.then(function(resp) {
		t.ok(API.user, 'API.user')
		t.equals(API.user.email, user.email,  'user email is equal')

		t.ok(store.getJSON('authKey'), 'storage has saved authKey')

		var API2 = new StremioAPIStore({ storage: store })
		t.ok(API2.user, 'API2.user')
		t.deepEquals(API.user, API2.user, 'API.user is the same as API2.user')

		return API2.request('getUser')
	})
	.then(function(resp) {
		t.ok(resp.email, 'has resp.email')
		t.deepEquals(resp, API.user, 'resp.user is same as API.user')

		return API.logout()
	})
	.then(function() {
		t.notOk(API.user, 'API.user is empty')
		t.notOk(store.getJSON('authKey'), 'storage does not have authKey')
		t.end()
	})
	.catch(function(err) {
		t.error(err)
	})
})


// @TODO: test legacy user record, whether login would be kept (by using a mock storage)

// @TODO: test if persisting auth and etc.

// @TODO: request vs requestWithAuth and etc.