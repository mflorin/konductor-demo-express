#!/usr/bin/env bash

set -eu

if [ -f .env ]; then

   set -o allexport; source .env; set +o allexport
fi

SERVER_PORT=${SERVER_PORT:-8080}

image_tag="konductor-demo-express"
container_name="konductor-demo-express"
arg="${1:-}"

function cleanup() {
  docker rm -f ${container_name} 2>/dev/null
  exit 0
}

# stop the container
if [ "${arg}" = "stop" ]; then
  cleanup
fi

docker build . -t "${image_tag}"

docker rm -f ${container_name} 2>/dev/null

trap cleanup SIGINT

docker_flags="-d"
if [ "${arg}" = "-d" ]; then
  # debug enabled - don't daemonize and run with an interactive tty
  docker_flags="-it"
fi

docker run --rm -p 443:${SERVER_PORT} --name "${container_name}" ${docker_flags} "${image_tag}"


# vim: ts=2: sw=2: ai: si

