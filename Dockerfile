FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

FROM node:20-alpine AS final
RUN apk add curl
WORKDIR /app
COPY --from=builder ./app/build ./build
COPY package*.json .
COPY prisma ./prisma
COPY storage ./storage
RUN npm install --omit=dev

ENTRYPOINT [ "npm", "run", "server" ]