FROM node:lts AS base

RUN corepack enable

FROM base AS build

WORKDIR /build

COPY package.json yarn.lock /build/

COPY client/ /build/client/
COPY server/ /build/server/

RUN yarn install && yarn workspace tacos-client run build

FROM base AS prod

EXPOSE 3000

CMD ["npm","start"]

WORKDIR /app

COPY --from=build /build/server/ /app/
COPY --from=build /build/client/build/ /app/public/

RUN yarn install
