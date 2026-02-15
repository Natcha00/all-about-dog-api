# ---------- Stage 1: Install dependencies ----------
FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# ---------- Stage 2: Build ----------
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---------- Stage 3: Production ----------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# สร้าง user ปลอดภัย
RUN addgroup -S nestjs && adduser -S nestjs -G nestjs

# copy เฉพาะสิ่งที่ต้องใช้จริง
COPY --from=builder /app/dist ./dist
COPY package.json ./

# ติดตั้งเฉพาะ production deps
RUN npm install --omit=dev

USER nestjs

EXPOSE 3000

CMD ["node", "dist/main.js"]
