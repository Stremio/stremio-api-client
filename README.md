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

* `endpoint`: URL to the API, default is `https://api.strem.io`

* `authKey`: session auth key, default is `null`

### Methods:

* `request(method, params)` - returns a promise



## StremioAPIStore

This is a stateful class that, when created, would take care of persistance and sync of the user and her add-ons collection

It exposes:

`APIStore.user` - User object

`APIStore.addons` - AddonCollection

`APIStore.login()`

`APIStore.register()`

`APIStore.logout()`

`APIStore.pushUser()`

`APIStore.pullUser`

`APIStore.pushAddonCollection()`

`APIStore.pullAddonCollection()`
