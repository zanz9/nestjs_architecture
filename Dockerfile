FROM node:20-alpine AS development
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build
RUN yarn install --production --frozen-lockfile

FROM node:20-alpine AS production
WORKDIR /app
COPY package.json yarn.lock ./
COPY --from=development /app/node_modules ./node_modules
COPY --from=development /app/dist ./dist

CMD ["yarn", "start:prod"] 