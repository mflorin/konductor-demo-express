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