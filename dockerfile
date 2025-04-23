FROM node:18.19.0-slim

WORKDIR /app

# Install openssl for Prisma
RUN apt-get update && apt-get install -y --no-install-recommends openssl libssl3 ca-certificates

RUN npm install -g pnpm@9.1.0

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY prisma ./prisma/
RUN npx prisma generate

COPY . .

ENV NODE_ENV production

EXPOSE 8787

CMD ["npx", "wrangler", "dev", "--ip", "0.0.0.0", "--port", "8787", "--env", "production"]
