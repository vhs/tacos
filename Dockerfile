FROM node:12

EXPOSE 3000
WORKDIR /app
CMD ["npm","start"]

COPY . /app

RUN cd /app \
    && cd /app/frontend \
    && npx yarn install \
    && npm run build \
    && cd /app \
    && npx yarn install --production
