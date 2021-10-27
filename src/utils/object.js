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