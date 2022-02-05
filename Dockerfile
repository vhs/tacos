FROM node:lts AS build

WORKDIR /build

RUN apt update && apt install -y rsync

COPY package.json .
COPY yarn.lock .

COPY client/ client/
COPY server/ server/

RUN npx yarn install
RUN npx yarn run build

FROM node:lts AS server-build

EXPOSE 3000
CMD ["npm","start"]
WORKDIR /app

COPY --from=build /build/server/ /app/