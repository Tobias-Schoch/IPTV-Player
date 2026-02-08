# Docker Deployment Guide

## Quick Start

### Development Mode

```bash
# Start development server with hot reload
docker-compose --profile dev up web-dev

# Access at http://localhost:3000
```

### Production Mode

```bash
# Build and start production container
docker-compose up -d web

# Check logs
docker-compose logs -f web

# Stop
docker-compose down
```

## Docker Commands

### Build

```bash
# Build production image
npm run docker:build

# Or manually
docker build -t iptv-player-web -f apps/web/Dockerfile .
```

### Run

```bash
# Start all services
npm run docker:up

# Stop all services
npm run docker:down

# View logs
npm run docker:logs
```

### Development

```bash
# Run in development mode (with hot reload)
docker-compose --profile dev up web-dev

# The app will be available at http://localhost:3000
# Code changes will automatically reload
```

## Docker Compose Profiles

### Production (default)
```bash
docker-compose up web
```
- Multi-stage build
- Optimized image size
- Production-ready

### Development
```bash
docker-compose --profile dev up web-dev
```
- Volume mounts for hot reload
- Node modules cached in volumes
- Fast iteration

## Environment Variables

Create `.env` file in the project root:

```env
NODE_ENV=production
NEXT_PUBLIC_APP_NAME=IPTV Player
NEXT_PUBLIC_APP_VERSION=1.0.0
```

## Dockerfile Stages

### Stage 1: Dependencies
- Install dependencies only
- Cached layer for faster builds

### Stage 2: Builder
- Build TypeScript packages
- Build Next.js application
- Generate optimized production build

### Stage 3: Runner
- Minimal runtime image
- Only production dependencies
- Non-root user for security
- Health check enabled

## Image Optimization

The production image is optimized for size and performance:

- **Base**: Node 20 Alpine (minimal)
- **Size**: ~150MB (compressed)
- **Layers**: Cached for fast rebuilds
- **Security**: Non-root user
- **Health**: Built-in health checks

## Troubleshooting

### Build Fails

```bash
# Clean build
docker-compose down -v
docker system prune -f

# Rebuild
npm run docker:build
```

### Port Already in Use

```bash
# Change port in docker-compose.yml
ports:
  - "3001:3000"  # Use port 3001 instead
```

### Volume Issues (Dev Mode)

```bash
# Remove volumes
docker-compose down -v

# Restart
docker-compose --profile dev up web-dev
```

## Production Deployment

### Docker Hub

```bash
# Tag image
docker tag iptv-player-web yourusername/iptv-player-web:latest

# Push to Docker Hub
docker push yourusername/iptv-player-web:latest
```

### Docker Swarm

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml iptv-player
```

### Kubernetes

See [kubernetes.md](./kubernetes.md) for Kubernetes deployment guide.

## Health Checks

The application exposes a health endpoint:

```bash
curl http://localhost:3000/api/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "uptime": 123.456,
  "environment": "production"
}
```

## Monitoring

### View Logs

```bash
# All logs
docker-compose logs -f

# Specific service
docker-compose logs -f web

# Last 100 lines
docker-compose logs --tail=100 web
```

### Container Stats

```bash
# Real-time stats
docker stats

# Or use docker-compose
docker-compose stats
```

## Best Practices

1. **Always use volume mounts in development** for hot reload
2. **Use multi-stage builds** to minimize image size
3. **Don't copy node_modules** - let Docker install them
4. **Use .dockerignore** to exclude unnecessary files
5. **Run as non-root user** for security
6. **Enable health checks** for production
7. **Use specific versions** for reproducible builds

## Next Steps

- [Production Deployment](./production-deployment.md)
- [Monitoring & Logging](./monitoring.md)
- [Performance Optimization](./performance.md)
