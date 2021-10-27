/*
 * Konductor service, used to make calls to the konductor API
 */

const axios = require('axios')

function Konductor(config) {
    this.config = config
}

/**
 * Sends a request to conductor and returns the headers and response body
 *
 * @param method http method
 * @param path konductor path e.g. /v2/interact
 * @param headers req headers
 * @param params query params
 * @param data req body (for post, put, patch)
 */
Konductor.prototype.run = async function(method, path, headers, params, data) {

    const requestHeaders = {
        'Authorization': `Bearer ${await this.config.ims.getAccessToken()}`,
        'x-gw-ims-org-id': this.config.ims.config.imsOrg,
        'x-api-key': this.config.ims.config.apiKey,
        'Content-Type': 'application/json',
        ...headers
    }

    const axiosConfig = {
        method,
        headers: requestHeaders,
        url: `${this.config.host}/${path}`,
        params: {
            'dataStreamId': this.config.dataStreamId,
            ...params
        },
        rejectUnauthorized: false
    }

    if (['post', 'put', 'patch'].includes(method.toLowerCase()) && data !== undefined) {
        axiosConfig.data = data
    }

    return axios(axiosConfig)

}


Konductor.prototype.personalize = async function(cgid, activityId) {
    const payload = {
        "query": {
            "personalization": {
                "schemas": [
                    "https://ns.adobe.com/personalization/html-content-item",
                    "https://ns.adobe.com/personalization/json-content-item",
                    "https://ns.adobe.com/personalization/redirect-item",
                    "https://ns.adobe.com/personalization/dom-action"
                ],
                "decisionScopes": [
                    "__view__"
                ]
            }
        },
        "event": {
            "xdm": {
                "identityMap": {
                    "CGID": [
                        {
                            "id": cgid,
                            "primary": true
                        }
                    ]
                },
                "eventType": "web.webpagedetails.pageViews",
                "web": {
                    "webPageDetails": {
                        "URL": `${this.config.siteName}`,
                        "name": "Homepage"
                    }
                },
                "timestamp": (new Date()).toISOString()
                //"timestamp": "2021-08-09T14:09:20.859Z"
            }
        }
    }

    const res = await this.run('post', '/v2/interact', {}, {}, payload)

    if (res.data.handle === undefined) {
        throw new Error('handle not found in personalization data')
    }

    if (!Array.isArray(res.data.handle)) {
        throw new Error('handle is not an array')
    }
    return findContent(res.data.handle, activityId)

}

/*
 * finds content replacement in a handle returned by the personalization API, in the form of
 * { content: string, selector: string }
 */
function findContent(handle, activityId) {
    let ret = []
    for (const el of handle) {
        if (el.payload === undefined || !Array.isArray(el.payload)) {
            continue
        }

        for (const p of el.payload) {
            if (p.items === undefined || !Array.isArray(p.items)) {
                continue
            }
            for (const item of p.items) {
                if (item.meta === undefined || item.data === undefined) {
                    continue
                }
                if (item.meta['activity.id'] === activityId) {
                    /* activity found */
                    ret.push({
                        content: item.data.content,
                        selector: item.data.selector
                    })

                }
            }
        }
    }

    return ret
}

module.exports = Konductor