var fetch = require('node-fetch');

function ApiClient(endpoint, authKey) {
    this.request = function(method, params) {
        var fetchOptions = {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: Object.assign({ authKey: authKey }, JSON.stringify(params))
        };

        return fetch(endpoint + '/api/' + method, fetchOptions)
            .then(function(resp) {
                if (resp.status !== 200) {
                    throw new Error('request failed with status code ' + resp.status);
                }

                if (resp.headers.get('content-type').indexOf('application/json') === -1) {
                    throw new Error('response type is not JSON');
                }

                return resp.json();
            })
            .then(function(body) {
                if (body.error) {
                    throw body.error;
                }

                if (!body.result) {
                    throw new Error('response has no result');
                }

                return body.result;
            });
    };
}

module.exports = ApiClient;
