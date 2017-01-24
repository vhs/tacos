FROM node:6.9.4-slim

WORKDIR /usr/src/app

COPY package.json /usr/src/app/
RUN cd /usr/src/app && npm install --production
COPY . /usr/src/app