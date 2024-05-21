# build environment
FROM node:18-alpine3.17 as build
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build

# production environment
FROM node:20-alpine3.19
COPY --from=build /app/dist .
ENTRYPOINT sh -c "node ."