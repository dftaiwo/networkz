FROM node:20-alpine AS dev
WORKDIR /app
ENV CI=1
COPY package.json package-lock.json* ./
RUN npm install --no-audit --no-fund
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]


FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --no-audit --no-fund
COPY . .
RUN npm run build


FROM caddy:2-alpine AS prod
COPY --from=builder /app/dist /srv
# Caddy is configured separately in compose; this image is only for static assets.
