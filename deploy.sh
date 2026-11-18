#!/bin/bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

# 用法：bash deploy.sh [local|docker]，默认 local
MODE="${1:-local}"

build() {
  echo "========== 构建 node-server =========="
  pnpm build
}

deploy_local() {
  if [ ! -f .env.server ]; then
    echo "[本地] 缺少 .env.server，请先复制 example.env.server 并配置"
    exit 1
  fi
  echo "[本地] 启动中..."
  kill $(lsof -t -i:20193) 2>/dev/null || true
  sleep 1
  nohup node --env-file=.env.server dist/output/server/index.mjs > /tmp/omnitrends-local.log 2>&1 &
  for i in $(seq 1 10); do
    if curl -sf -o /dev/null http://localhost:20193/ 2>/dev/null; then
      echo "[本地] 启动成功 http://localhost:20193/"
      return 0
    fi
    sleep 1
  done
  echo "[本地] 启动超时，日志："
  tail -10 /tmp/omnitrends-local.log
  return 1
}

deploy_docker() {
  echo "[Docker] 构建并启动中..."
  docker compose -f docker-compose.local.yml up -d --build
  echo "[Docker] 启动成功 http://localhost:4444/"
}

build

case "$MODE" in
  docker)
    deploy_docker
    ;;
  local|*)
    deploy_local
    ;;
esac