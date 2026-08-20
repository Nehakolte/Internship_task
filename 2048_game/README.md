# Docker 2048 Game - Internship Practical

A simple 2048 browser game served by Nginx inside Docker.

## Requirements covered
- Docker Engine installation and verification
- Docker Hub image pull
- Container creation and management
- Custom Docker image using Dockerfile
- HTML/JavaScript 2048 application in a container
- Docker volume
- Custom Docker network
- Multi-container Docker Compose deployment
- Docker Hub image push

## Run with Dockerfile
```bash
docker build -t docker-2048-game .
docker run -d --name docker-2048-game -p 8080:80 docker-2048-game
```
Open http://localhost:8080

## Run with Docker Compose
```bash
docker compose up -d --build
docker compose ps
```
Open http://localhost:8080

Stop:
```bash
docker compose down
```

## Docker Hub
Replace YOUR_USERNAME with your Docker Hub username:
```bash
docker tag docker-2048-game YOUR_USERNAME/docker-2048-game:latest
docker push YOUR_USERNAME/docker-2048-game:latest
```
