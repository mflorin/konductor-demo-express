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

const uuid = require('uuid')

const cookieName = 'FPID'
const cookieOptions = {
    httpOnly: true,
    sameSite: 'lax',
    secure: true
}

module.exports = {
    getOrSetCookie: (req, res) => {
        let fpid
        if (req.cookies[cookieName] === undefined) {
            fpid = uuid.v4()
            console.log(`creating FPID: ${fpid}`)
            res.cookie(cookieName, fpid, cookieOptions)
        } else {
            fpid = req.cookies[cookieName]
            console.log(`reusing FPID ${fpid}`)
        }

        return fpid
    }
}