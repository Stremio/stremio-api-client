# stremio-api-client

Facilitates the connection between the `stremio-api` and Stremio, with extras such as user/add-on sync and persistence.

Contains two main modules:

## StremioAPIClient

This is a stateless module to request the `stremio-api`

It's constructed like this:

```javascript
var StremioAPIClient = require('stremio-api-client').StremioAPIClient
var API = new StremioAPIClient(options)
```

### Options: 

* `endpoint` - URL to the API, default is `https://api.strem.io`

* `authKey` - session auth key, default is `null`

### Methods:

* `request(method, params)` - returns a promise



## StremioAPIStore

This is a stateful class that, when created, would take care of persistance and sync of the user and her add-ons collection

It's constructed like this:

```javascript
var StremioAPIStore = require('stremio-api-client').StremioAPIStore
var APIStore = new StremioAPIStore(options)
```

### Options:

* `endpoint` - URL to the API, default is `https://api.strem.io`

* `storage` - a storage object with synchronous `getJSON` and `setJSON` properties

### Properties:

`APIStore.user` - User object

`APIStore.addons` - AddonCollection

### Methods:

**NOTE:** All the methods return promises

`APIStore.login({ email, password, fbLoginToken })` - logs in; `fbLoginToken` is optional

`APIStore.register({ email, password })` - registers a new user

`APIStore.logout()` - logs out

All of the above 3 methods change `API.user` and therefore will emit (upon success) `user-change`

`APIStore.pushUser()` - pushes the local `API.user` to the API; requires to be logged in

`APIStore.pullUser()` - pull the latest user from the API; requires to be logged in

`pullUser()` may emit `user-change` if the remote user is more recent

`APIStore.pushAddonCollection()` - pushes local `API.addons` collection to the API (via `addonCollectionSet`); requires to be logged in

`APIStore.pullAddonCollection()` - pulls the remote add-on collection (via `addonCollectionGet`), may emit `addons-change` or `addons-different`

### Events:

`user-change`: emitted when the User is changed (by ID, i.e. completely different user)

`addons-change`: emitted when the add-on set (AddonCollection) is changed

`addons-different`: emitted when the add-on collection is different (compared through transportUrls)
