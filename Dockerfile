FROM node:16-alpine AS base

# Create app directory
WORKDIR /app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./
COPY prisma ./prisma/

FROM base as dev
ENV NODE_ENV=dev
RUN npm install --frozen-lockfile
COPY . .
RUN printenv
RUN npm run migrate:dev
# RUN npm run start:dev
# CMD [ "npm", "run", "migrate:dev" ]
CMD [ "npm", "run", "start:dev" ]

FROM dev AS test
ENV NODE_ENV=test
CMD [ "npm", "run", "test" ]

FROM test AS test-cov
CMD [ "npm", "run", "test:cov" ]

FROM test AS test-watch
ENV GIT_WORK_TREE=/app GIT_DIR=/app/.git
RUN apk add git
CMD [ "npm", "run", "test:watch" ]

FROM base AS prod
ENV NODE_ENV=production
RUN npm install --frozen-lockfile --production
COPY . .
RUN npm global add @nestjs/cli
RUN npm run migrate:dev
RUN npm build
CMD [ "npm", "run", "start:prod" ]