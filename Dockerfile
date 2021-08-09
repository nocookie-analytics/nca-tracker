FROM node:15 as build-stage

WORKDIR /app

COPY package.json yarn.lock /app/

RUN yarn install --frozen-lockfile

COPY ./ /app/

RUN mkdir -p dist && yarn build


FROM nginx:latest

COPY --from=build-stage /app/dist/ /usr/share/nginx/html
