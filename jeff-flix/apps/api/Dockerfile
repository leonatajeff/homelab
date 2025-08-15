FROM oven/bun:1
WORKDIR /app

COPY bun.lock package.json bunfig.toml tsconfig.json ./
COPY apps/api ./apps/api
COPY packages ./packages

RUN bun install --frozen-lockfile

EXPOSE 3000
CMD ["bun", "run", "apps/api/index.ts"]