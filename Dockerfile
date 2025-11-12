# ARGs for flexibility
ARG PARENT_VERSION=2.8.5-node22.16.0
ARG PORT=3000
ARG PORT_DEBUG=9229

# Development stage
FROM defradigital/node-development:${PARENT_VERSION} AS development
LABEL uk.gov.defra.ffc.parent-image=defradigital/node-development:${PARENT_VERSION}

WORKDIR /usr/src/app
ENV TZ="Europe/London"
ARG PORT
ARG PORT_DEBUG
ENV PORT=${PORT}
EXPOSE ${PORT} ${PORT_DEBUG}

# Install dependencies
COPY --chown=node:node --chmod=755 package*.json ./
RUN npm ci

# Copy source and build frontend
COPY --chown=node:node --chmod=755 . .
RUN npm run build:frontend

CMD ["npm", "run", "docker:dev"]

# Production build stage
FROM development AS production_build
ENV NODE_ENV=production
RUN npm run build:frontend

# Production stage
FROM defradigital/node:${PARENT_VERSION} AS production
LABEL uk.gov.defra.ffc.parent-image=defradigital/node:${PARENT_VERSION}

ENV TZ="Europe/London"
USER root
RUN apk add --no-cache curl
USER node

# Copy built assets
COPY --from=production_build /home/node/package*.json ./
COPY --from=production_build /home/node/src ./src/
COPY --from=production_build /home/node/.public/ ./.public/

# Install only production dependencies
RUN npm ci --omit=dev

ARG PORT
ENV PORT=${PORT}
EXPOSE ${PORT}

# Healthcheck for platform compliance
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:${PORT}/health || exit 1

CMD ["node", "src"]