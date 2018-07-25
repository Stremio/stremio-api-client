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

`APIStore.login()`

`APIStore.register()`

`APIStore.logout()`

`APIStore.pushUser()`

`APIStore.pullUser`

`APIStore.pushAddonCollection()`

`APIStore.pullAddonCollection()`
