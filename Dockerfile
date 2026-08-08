FROM oven/bun:canary-alpine AS build
WORKDIR /app
COPY package.json bun.lock bunfig.toml ./
RUN bun install --frozen-lockfile
COPY tsconfig.json vite.config.ts components.json oxfmt.config.ts oxlint.config.ts ./
COPY public ./public
COPY src ./src
RUN bun run routes:generate && bun run build

FROM oven/bun:canary-alpine
WORKDIR /app
ENV HOST=0.0.0.0
COPY --from=build /app/.output ./.output
COPY data/processed ./data/processed
CMD ["bun", ".output/server/index.mjs"]
