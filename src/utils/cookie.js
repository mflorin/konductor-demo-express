const uuid = require('uuid')

const cookieName = 'CGID'
const cookieOptions = {
    httpOnly: true,
    sameSite: 'lax',
    secure: true
}

module.exports = {
    getOrSetCookie: (req, res) => {
        let cgid
        if (req.cookies[cookieName] === undefined) {
            cgid = uuid.v4()
            console.log(`creating CGID: ${cgid}`)
            res.cookie(cookieName, cgid, cookieOptions)
        } else {
            cgid = req.cookies[cookieName]
            console.log(`reusing CGID ${cgid}`)
        }

        return cgid
    }
}