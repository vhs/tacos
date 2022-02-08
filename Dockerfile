FROM node:lts AS build

WORKDIR /build


RUN npm install -g npm

COPY package.json .
COPY yarn.lock .

COPY client/ client/
COPY server/ server/

RUN npx yarn install

RUN npx yarn workspace tacos-client run build

FROM node:lts

EXPOSE 3000
CMD ["npm","start"]
WORKDIR /app

RUN npm install -g npm

COPY --from=build /build/server/ /app/
COPY --from=build /build/client/build/ /app/public/

RUN npx yarn install