FROM node:carbon

WORKDIR /app

COPY . /app
RUN cd /app && rm -fR node_modules && npm install --production
