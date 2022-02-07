FROM node:lts AS build

WORKDIR /build


RUN npm install -g npm

COPY package.json .
COPY yarn.lock .

COPY client/ client/
COPY server/ server/

RUN npx yarn install

RUN apt update && apt install -y rsync

RUN npx yarn run build

FROM node:lts AS server-build

EXPOSE 3000
CMD ["npm","start"]
WORKDIR /app

RUN npm install -g npm

COPY --from=build /build/server/ /app/