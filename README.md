# Konductor Demo Express

This is a minimalistic NodeJS express web app that demonstrates server-side 
integration with the Konductor API.

## Goals

The app provides a server side rendered front-end and acts as a server that sends data collection and
personalization requests to konductor.

## Installation

### Prerequisites

- Docker (https://www.docker.com/)
- Access to Adobe Developer Console
- A valid datastream setup in Adobe Lunch

### Setup

1. Clone the project
    ```shell
    $ git clone git@github.com:mflorin/konductor-demo-express.git
    ```
2. Add an entry in your hosts file to have `mybusiness.com` point to `127.0.0.1`
    ```shell
    $ sudo vim /etc/hosts
    ```
3. Create an `.env` file by copying the `env.template` file
    ```shell
    $ cd konductor-demo-express
    $ cp env.template .env
    ```
4. Fill in the following variables in the `.env` file 
    - `IMS_ORG` - `ORGANIZATION ID` from the `Credential details` page in Adobe Dev Console
    - `IMS_TECHNICAL_ACCOUNT_ID` - `TECHNICAL ACCOUNT ID` from the same page as above
    - `IMS_CLIENT_ID` - `CLIENT ID` from the same page as above
    - `IMS_CLIENT_SECRET` - `CLIENT SECRET` from the same page as above
    - `DATASTREAM_ID` - A valid datastream you've set up.

5. Fill in `IMS_PRIVATE_KEY` with an "inline" version of the project's private key file, where you replace all new lines with `\n`.
You can copy and paste the output of 
    ```shell
    $ awk '{printf "%s\\n", $0}' PATH_TO_PRIVATE_KEY_FILE
    ```

6. Import the server private key and root certificate in your keychain or keystore
    - On Linux:
    ```shell
    $ sudo cp certs/rootCA.pem /usr/local/share/ca-certificates
    $ sudo cp certs/server.crt /usr/local/share/ca-certificates
    $ sudo update-ca-certificates
    ```
    - On OSX:
    ```shell
    $ open certs/rootCA.pem
    $ open certs/server.crt
    ```
    (or double click those files in Finder)
   
    Open `Keychain Access`. You should see two certificates in the `System` section for 
    `mybusiness.com`. Double click each of them and set the `Trust` configuration to `Always`. 

*NOTE*: You can get all the information for steps 4 and 5 from your `adobe.io/console`.
Open your project, select `Service Account(JWT)` in the left menu and click the `Credential details` tab.

The private key file is the one found in the configuration archive you've downloaded
when you've creted the project in the Adobe Developer Console

### Adobe Target Content Personalization

1. Enable Adobe Target on your Datastream in Adobe Launch
2. Create an Adobe Target Activity
3. Edit the Activity
4. Configure Page Delivery (click the gear icon) to use the URL: `https://mybusiness.com`
5. Edit the Page name to be: `Homepage`
6. Save the activity
7. Copy the `Activity ID` found in the `Overview` tab
8. Fill in the `PERSONALIZATION_ACTIVITY_ID` in the `.env` file with the value of your `Activity ID`

## Usage

Use the `demo.sh` script provided with the source code to run the demo.
```shell
$ ./demo.sh
```

This will build and launch a docker container with your app.

Access the demo in your browser by visiting https://mybusiness.com .

### Running through a proxy

In order to use a proxy you need to set `PROXY_HOST` and `PROXY_PORT` in your `.env` file to point to your proxy configuration.

**!IMPORTANT!**: Because the demo is running in a docker container, you need to use `host.docker.internal` instead
of `localhost` to point to your machine.

```dotenv
PROXY_HOST="host.docker.internal"
PROXY_PORT=8888
```

### Troubleshooting the demo

In order to see the output of the container and debug any errors, run the 
`demo.sh` script with the `-d` parameter like this:

```shell
$ ./demo.sh -d
```

### Common errors

#### Browser rejects the certificate

Most of the time you can instruct the browser to move on (usually in the `Advanced` section of the warning window)

The reason could be one of the following:
- the certificates were not imported correctly
- you've regenerated the certificates and used in invalid fqdn
- you've regenerated the certificates and didn't use the correct domain name

#### Docker container already exists

- check if the container stopped correctly `docker ps -a`
- manually remove any leftover containers `docker rm -f konductor-demo-express` or run `./demo.sh stop`

### Stopping the demo

Run
```shell
$ ./demo.sh stop
```

or manually stop the `konductor-demo-express` docker container:

```shell
docker rm -f konductor-demo-express
```

### Changing the domain you're running the demo on

In order to change the domain you need to do the following:

#### Regenerate the server certificates

First you need to edit `certs/v3.ext` and change `DNS.1` and `DNS.2` to point to your desired domain name.
Then you need to run `./gen-certs.sh` from the `certs` folder and fill in the form with valid data.

#### Update the `SERVER_KEY_PASSPHRASE`

Update the `.env` file and put the new password you've used when recreating the certificates into
the `SERVER_KEY_PASSPHRASE` env var.

#### Change `SITE_URL` in `.env`

Edit `.env` and change `SITE_URL`

#### Edit the Adobe Target Activity

Go to Adobe Target, edit your activity and change `Page Delivery` to have the URL point to your new domain.

## Contributing

Contributions are welcomed! Read the [Contributing Guide](./.github/CONTRIBUTING.md) for more information.

## Licensing

This project is licensed under the Apache V2 License. See [LICENSE](LICENSE) for more information.