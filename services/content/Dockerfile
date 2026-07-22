FROM node:26-slim AS build
WORKDIR /repo
COPY . .
RUN npm ci
RUN npm run build -w libs/auth \
  && npm run build -w libs/contracts \
  && npm run build -w services/content

FROM node:26-slim AS runtime
ENV NODE_ENV=production
WORKDIR /repo
COPY --from=build /repo/node_modules ./node_modules
COPY --from=build /repo/package.json ./package.json
COPY --from=build /repo/libs/auth/package.json ./libs/auth/package.json
COPY --from=build /repo/libs/auth/dist ./libs/auth/dist
COPY --from=build /repo/libs/contracts/package.json ./libs/contracts/package.json
COPY --from=build /repo/libs/contracts/dist ./libs/contracts/dist
COPY --from=build /repo/services/content/package.json ./services/content/package.json
COPY --from=build /repo/services/content/dist ./services/content/dist
COPY --from=build /repo/services/content/drizzle ./services/content/drizzle
WORKDIR /repo/services/content
CMD ["sh", "-c", "node dist/database/migrate.js && node dist/main.js"]
