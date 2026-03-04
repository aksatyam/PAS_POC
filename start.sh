#!/bin/bash

# PAS Prototype - Start Script
# Runs both backend (port 4000) and frontend (port 3002)

cleanup() {
  echo ""
  echo "Shutting down..."
  kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
  wait $BACKEND_PID $FRONTEND_PID 2>/dev/null
  echo "Done."
  exit 0
}

trap cleanup SIGINT SIGTERM

DIR="$(cd "$(dirname "$0")" && pwd)"

echo "========================================="
echo "  IMGC PAS Prototype — Startup"
echo "========================================="
echo ""

# Kill any existing processes on configured ports
for PORT in 4000 3002; do
  PID=$(lsof -ti :$PORT 2>/dev/null)
  if [ -n "$PID" ]; then
    echo "[Cleanup] Killing process on port $PORT (PID: $PID)..."
    kill -9 $PID 2>/dev/null
    sleep 1
  fi
done

echo ""

# Start backend
echo "[Backend]  Starting on port 4000..."
cd "$DIR/backend" && npm run dev &
BACKEND_PID=$!

# Wait a moment for backend to initialize
sleep 2

# Start frontend
echo "[Frontend] Starting on port 3002..."
cd "$DIR/frontend" && npm run dev &
FRONTEND_PID=$!

echo ""
echo "========================================="
echo "  Backend:  http://localhost:4000/api-docs"
echo "  Frontend: http://localhost:3002"
echo "========================================="
echo ""
echo "Press Ctrl+C to stop both."
echo ""

wait
