const fs = require('fs')
const https = require('https')
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const path = require("path");

const Ims = require('./services/ims')
const Konductor = require('./services/konductor')
const utils = require('./utils')

/* read .env file */
const dotenv = require('dotenv')
dotenv.config()

/* the port this server runs on */
let port = 8080
if (process.env['SERVER_PORT'] !== undefined) {
    port = Number(process.env['SERVER_PORT'])
    if (isNaN(port)) {
        throw new Error(`invalid port number specified in SERVER_PORT env var: ${process.env['SERVER_PORT']}`)
    }
}

/* personalization activity id used to fetch personalized content from Adobe Target */
if (process.env['PERSONALIZATION_ACTIVITY_ID'] === undefined) {
    throw new Error('PERSONALIZATION_ACTIVITY_ID env var is missing')
}
const personalizationActivityId = process.env['PERSONALIZATION_ACTIVITY_ID']

/* validate server certificates configuration */
if (process.env['SERVER_KEY'] === undefined) {
    throw new Error('no path to the server private key specified in SERVER_KEY env var')
}

if (process.env['SERVER_CERT'] === undefined) {
    throw new Error('no path to the server certificate was specified in SERVER_CERT env var')
}

if (process.env['SERVER_KEY_PASSPHRASE'] === undefined) {
    throw new Error('no server key passphrase specified in SERVER_KEY_PASSPHRASE env var')
}


/* trap ctrl-c */
process.on('SIGINT', () => {
    console.info("Interrupted")
    process.exit(0)
})


/* do this to be able to proxy through Charles which terminates SSL with a self signed certificate */
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

/* setup IMS config */
const imsConfig = {
    host: process.env['IMS_HOST'] || 'https://ims-na1.adobelogin.com',
    proxyHost: process.env['IMS_PROXY_HOST'],
    imsOrg: process.env['IMS_ORG'],
    technicalAccountId: process.env['IMS_TECHNICAL_ACCOUNT_ID'],
    apiKey: process.env['IMS_CLIENT_ID'],
    privateKey: process.env['IMS_PRIVATE_KEY'],
    clientSecret: process.env['IMS_CLIENT_SECRET'],
    metaScope: process.env['IMS_META_SCOPE']
}

/* create ims service object */
const ims = new Ims(imsConfig)

/* konductor config */
const konductorConfig = {
    ims,
    host: process.env['KONDUCTOR_HOST'] || 'https://server.adobedc.net',
    dataStreamId: process.env['DATASTREAM_ID'],
    siteName: process.env['SITE_URL'] || 'https://mybusiness.com',
    personalizationPageName: process.env['PERSONALIZATION_PAGE_NAME'] || 'Homepage'
}

/* create konductor service object */
const konductor = new Konductor(konductorConfig)


/* initialize express app */
const app = express()

/* template engine setup */
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

/* cors middleware */
app.use(cors({
    origin: 'https://mybusiness.com',
    credentials: true
}))

/* express middlewares for cookie parsing, static files and body parsing */
app.use(cookieParser())
app.use(express.static('public'))
app.use(express.json())
app.use(bodyParser.text())

/* main route */
app.get('/', async (req, res) => {

    /* get the cgid cookie or create it if absent */
    const cgid = utils.cookie.getOrSetCookie(req, res)

    let personalizationJs = ''
    try {
        const personalization = await konductor.personalize(cgid, personalizationActivityId)
        for (const p of personalization) {
            personalizationJs += `$("${p.selector}").html("${p.content}");`
        }
    } catch (err) {
        console.log(err)
    }

    res.render('index', {personalizationJs, konductorConfig, cgid})
})

/* https server startup */
https.createServer({
    key: fs.readFileSync(process.env['SERVER_KEY']),
    cert: fs.readFileSync(process.env['SERVER_CERT']),
    passphrase: process.env['SERVER_KEY_PASSPHRASE']
}, app).listen(port, () => {
    console.log(`listening on port ${port}`)
})

