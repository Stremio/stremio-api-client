global.fetch = require('node-fetch')
var StremioAPIStore = require('..').StremioAPIStore
var tape = require('tape')
var MemoryStorage = require('../lib/memoryStorage')


var defaultStore = new MemoryStorage()

var api = new StremioAPIStore({ storage: defaultStore })

// @TODO: test StremioAPIClient too


tape('basic call', function(t) {
	t.ok(api.endpoint, 'has endpoint')

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

tape('API.addons is initialized by default', function(t) {
	t.ok(api.addons, 'api.addons is there')
	t.ok(api.addons.getAddons().length > 0, 'api.addons.getAddons() has addons')
	t.end()
})

tape('pullUser does not work without api.user', function(t) {
	api.pullUser()
	.then(function() {
		t.error('should not be here')
	})
	.catch(function(err) {
		t.ok(err, 'has error')
		t.equals(err.message, 'user required to invoke this')
		t.end()
	})
});

var user = {
	email: 'stremioapiclient+'+Date.now()+'@strem.io',
	password: '215552'+Date.now(),
}

tape('register', function(t) {
	var userChangeEmitted = false

	api.events.on('user-change', function(){ userChangeEmitted = true })
	api.register(user)
	.then(function(resp) {
		t.ok(api.user, 'api.user')
		t.equals(api.user.email, user.email,  'user email is equal')
		t.ok(userChangeEmitted, 'user-change emitted')
		t.end()
	})
	.catch(function(err) {
		t.error(err)
	})
})

// @TODO: proper tests of pullAddonCollection, pushAddonCollection
// @TODO: to properly test this, first do a addonCollectionSet, and then check if this updates it
tape('pullAddonCollection', function(t) {
	var addonsChangeEmitted = false
	var addonsDifferentEmitted = false

	api.events.on('addons-change', function() { addonsChangeEmitted = true })
	api.events.on('addons-different', function() { addonsDifferentEmitted = true })

	api.pullAddonCollection()
	.then(function() {
		// @TODO: what's said in the prev comment
		t.ok(api.addons, 'api.addons is there')
		t.ok(api.addons.getAddons().length > 0, 'api.addons.getAddons() has addons')
		t.ok(addonsChangeEmitted, 'addons-change emitted')
		t.notOk(addonsDifferentEmitted, 'addons-different not emitted')
		t.end()
	})
	.catch(function(err) {
		t.error(err)
	})
});

tape('pushAddonCollection', function(t) {
	api.pushAddonCollection()
	.then(function() {
		// @TODO: properly test if this works
		t.ok(api.addons, 'api.addons is there')
		t.ok(api.addons.getAddons().length > 0, 'api.addons.getAddons() has addons')
		t.end()
	})
	.catch(function(err) {
		t.error(err)
	})
})

// @TODO: pullUser/pushUser proper tests

// @TODO: finish this test
tape('pullUser', function(t) {
	api.pullUser()
	.then(function() {
		// @TODO: what's said in the prev comment
		t.ok(api.user, 'api.user is there')
		t.end()
	})
	.catch(function(err) {
		t.error(err)
	})
});

tape('pushUser', function(t) {
	api.pushUser()
	.then(function() {
		// @TODO: what's said in the prev comment
		t.ok(api.user, 'api.user is there')
		t.end()
	})
	.catch(function(err) {
		t.error(err)
	})
})



// @TODO: from a logged in state, log in again with another account
// @TODO: check if add-ons is reset !!

tape('storage persists', function(t) {
	var user = {
		email: 'stremioapiclient2+'+Date.now()+'@strem.io',
		password: '215552'+Date.now(),
	}

	var store = new MemoryStorage()
	var API = new StremioAPIStore({ storage: store })
	API.register(user)
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

		// @TODO: API.addons is initialized by default, same as API1's add-ons

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

tape('migrationg legacy user works', function(t) {
	var store = new MemoryStorage()
	var copiedUser = Object.assign({ authKey: defaultStore.getJSON('authKey') }, defaultStore.getJSON('user'))

	store.setJSON('user', copiedUser)

	var API = new StremioAPIStore({ storage: store })

	t.ok(store.getJSON('authKey'), 'store has authKey')

	API.pullUser()
	.then(function() {
		// @TODO: what's said in the prev comment
		t.ok(api.user, 'api.user is there')
		t.end()
	})
	.catch(function(err) {
		t.error(err)
	})
})

/*
tape('add-on collection persisted even without being logged in', function(t) {
// @TODO
})
*/


tape('logout', function(t) {
	api.logout()
	.then(function() {
		t.notOk(api.user, 'api.user should be empty')
		// @TODO: test if storage authKey is reset
		// @TODO: test if storage addons is reset
		// @TODO: test if API.addons has been reset to official
		t.end()
	})
	.catch(function(err) {
		t.error(err)
	})
})
