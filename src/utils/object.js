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

module.exports = {
    setIfNotPresent: (object, pseudoXPath, value) => {
        const parts = pseudoXPath.split('.')

        let current = object
        for (let i = 0; i < parts.length - 1; i ++) {
            const part = parts[i]
            if (current[part] === undefined) {
                /* node found, return */
                current[part] = {}
            } else {
                if (typeof(current[part]) !== 'object') {
                    return
                }
            }
            current = current[part]
        }
        current[parts[parts.length - 1]] = value
    }
}