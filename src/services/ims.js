/*
Copyright 2022 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

/*
 * IMS communication service, used for authentication
 */

const FormData = require('form-data')
const rs = require('jsrsasign')
const axios = require("axios");

/**
 * IMS constructor
 *
 * @param config IMS config
 * @constructor
 */
function Ims(config) {
    this.config = config
    this.accessToken = {
        token: undefined,
        expiresAt: 0
    }

    this.checkConfig()
}

Ims.prototype.checkConfig = function() {

    const mandatory = [
        'host', 'imsOrg', 'technicalAccountId',
        'apiKey', 'privateKey', 'clientSecret',
        'metaScope'
    ]

    for (const key of mandatory) {
        if (this.config[key] === undefined) {
            throw new Error(`invalid ims config: missing key ${key}`)
        }
    }

}

/**
 * Build JWT to be used in IMS requests
 *
 * @returns {string} jwt
 */
Ims.prototype.getJwt = function() {

    const header = {
        "alg": "RS256"
    };

    const data = {
        "exp": Math.round(87000 + Date.now() / 1000),
        "iss": this.config.imsOrg,
        "sub": this.config.technicalAccountId,
        "aud": this.config.host + "/c/" + this.config.apiKey,
        [`${this.config.host}/s/${this.config.metaScope}`]: true
    };

    const sHeader = JSON.stringify(header);
    const sPayload = JSON.stringify(data);
    return rs.KJUR.jws.JWS.sign("RS256", sHeader, sPayload, this.config.privateKey);
}

/**
 * Get access token from IMS
 */
Ims.prototype.fetchAccessToken = async function() {

    const jwt = this.getJwt()

    const formData = new FormData();
    formData.append('client_id', this.config.apiKey);
    formData.append('client_secret', this.config.clientSecret);
    formData.append('jwt_token', jwt)

    const axiosConfig = {
        headers: formData.getHeaders()
    }

    if (this.config.proxy !== undefined) {
        axiosConfig.proxy = this.config.proxy
    }
    const res = await axios.post(`${this.config.host}/ims/exchange/jwt`, formData, axiosConfig)

    /* validate ims response */
    if (res.data.access_token === undefined) {
        throw new Error('missing access_token in ims response')
    }

    if (res.data.token_type === undefined) {
        throw new Error('missing token_type in ims response')
    }

    if (res.data.expires_in === undefined) {
        throw new Error('missing expires_in in ims response')
    }

    if (res.data.token_type !== 'bearer') {
        throw new Error(`invalid ims token_type: expected 'bearer' got ${res.data.token_type}`)
    }

    const expiresIn = Number(res.data.expires_in)
    if (isNaN(expiresIn)) {
        throw new Error(`invalid expires_in in ims response: ${res.data.expires_in}`)
    }

    return {
        token: res.data.access_token,
        expiresAt: Date.now() + expiresIn
    }
}

Ims.prototype.getAccessToken = async function() {
    if (this.accessToken.token === undefined || this.accessToken.expiresAt <= Date.now()) {
        this.accessToken = await this.fetchAccessToken()
    }

    return this.accessToken.token
}

module.exports = Ims