FROM node

EXPOSE 3000
WORKDIR /app
CMD ["npm","start"]

COPY . /app

RUN cd /app \
    && git submodule update --init --recursive \
    && cd /app/frontend \
    && rm -fR node_modules \
    && npx yarn install \
    && npm run build \
    && cd /app \
    && rm -fR node_modules \
    && npx yarn install --production
