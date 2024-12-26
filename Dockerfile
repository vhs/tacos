FROM node:lts-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM scratch AS source

WORKDIR /build

COPY . .

FROM base AS build-base

RUN apt-get update && apt-get install -y --no-install-recommends rsync && apt-get clean

FROM build-base AS build

ENV NODE_ENV=production

WORKDIR /build

COPY --from=source /build/pnpm-lock.yaml /build/

RUN pnpm fetch

COPY --from=source /build/client/ /build/client/
COPY --from=source /build/server/ /build/server/
COPY --from=source /build/package.json /build/
COPY --from=source /build/pnpm-workspace.yaml /build/

RUN pnpm install -r --offline && pnpm run build

FROM base AS prod

WORKDIR /build

COPY --from=source /build/pnpm-lock.yaml /build/

RUN pnpm fetch --prod

COPY --from=source /build/server/ /build/server/
COPY --from=build /build/server/public/ /build/server/public/

RUN pnpm --filter=tacos-server deploy --prod /app

FROM base

WORKDIR /app

COPY --from=prod /app/ /app/

EXPOSE 7000

ENV PORT=7000

CMD [ "pnpm", "start" ]
