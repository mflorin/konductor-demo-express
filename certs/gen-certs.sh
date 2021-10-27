#!/usr/bin/env bash

set -eu

# gen root CA private key
openssl genrsa -des3 -out rootCA.key 2048

# gen root CA cert
openssl req -x509 -new -nodes -key rootCA.key -sha256 -days 1024  -out rootCA.pem

# create new private key and csr
openssl req -new -nodes -out server.csr -newkey rsa:2048 -keyout server.key

# generate and self-sign cert
openssl x509 -req -in server.csr -CA rootCA.pem -CAkey rootCA.key -CAcreateserial -out server.crt -days 500 -sha256 -extfile v3.ext

# vim: ts=2: sw=2: ai: si

