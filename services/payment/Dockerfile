FROM node:26-slim AS build
WORKDIR /repo
COPY . .
RUN npm ci
RUN npm run build -w libs/auth \
  && npm run build -w libs/contracts \
  && npm run build -w services/payment
RUN npm prune --omit=dev

FROM node:26-slim AS runtime
ENV NODE_ENV=production
WORKDIR /repo
COPY --from=build /repo/node_modules ./node_modules
COPY --from=build /repo/package.json ./package.json
COPY --from=build /repo/libs/auth/package.json ./libs/auth/package.json
COPY --from=build /repo/libs/auth/dist ./libs/auth/dist
COPY --from=build /repo/libs/contracts/package.json ./libs/contracts/package.json
COPY --from=build /repo/libs/contracts/dist ./libs/contracts/dist
COPY --from=build /repo/services/payment/package.json ./services/payment/package.json
COPY --from=build /repo/services/payment/dist ./services/payment/dist
COPY --from=build /repo/services/payment/drizzle ./services/payment/drizzle
WORKDIR /repo/services/payment
CMD ["sh", "-c", "node dist/database/migrate.js && node dist/main.js"]
