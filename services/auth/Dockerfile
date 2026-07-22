FROM node:26-slim AS build
WORKDIR /repo
COPY . .
RUN npm ci
RUN npm run build -w libs/auth && npm run build -w services/auth

FROM node:26-slim AS runtime
ENV NODE_ENV=production
WORKDIR /repo
COPY --from=build /repo/node_modules ./node_modules
COPY --from=build /repo/package.json ./package.json
COPY --from=build /repo/libs/auth/package.json ./libs/auth/package.json
COPY --from=build /repo/libs/auth/dist ./libs/auth/dist
COPY --from=build /repo/services/auth/package.json ./services/auth/package.json
COPY --from=build /repo/services/auth/dist ./services/auth/dist
COPY --from=build /repo/services/auth/drizzle ./services/auth/drizzle
WORKDIR /repo/services/auth
CMD ["sh", "-c", "node dist/database/migrate.js && node dist/seed/seed.js && node dist/main.js"]
