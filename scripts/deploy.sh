#! /usr/bin/env sh

# Exit in case of error
set -e

DOMAIN=${DOMAIN} \
TAG=${TAG} \
STACK_NAME=nca-client \
docker-compose \
-f docker-compose.yml \
config > docker-stack.yml

docker stack deploy --with-registry-auth --resolve-image changed -c docker-stack.yml --with-registry-auth "${STACK_NAME}"
