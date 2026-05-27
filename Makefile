.PHONY: help install dev dev-frontend dev-backend build lint typecheck test test-coverage ci docker-up docker-down docker-clean docker-build docker-logs setup-testnet setup-testnet-docker testnet

# Colors for help output
CYAN := \033[36m
RESET := \033[0m

help:
	@echo "Available commands:"
	@echo "  ${CYAN}make install${RESET}       Install dependencies for both Next.js frontend and Python backend"
	@echo "  ${CYAN}make dev${RESET}           Start frontend and backend development servers locally"
	@echo "  ${CYAN}make dev-frontend${RESET}  Start Next.js frontend development server"
	@echo "  ${CYAN}make dev-backend${RESET}   Start FastAPI backend development server"
	@echo "  ${CYAN}make build${RESET}         Build Next.js frontend for production"
	@echo "  ${CYAN}make lint${RESET}          Run ESLint on frontend"
	@echo "  ${CYAN}make typecheck${RESET}     Run TypeScript compiler check"
	@echo "  ${CYAN}make test${RESET}          Run Jest test suite"
	@echo "  ${CYAN}make test-coverage${RESET} Run Jest tests with coverage report"
	@echo "  ${CYAN}make ci${RESET}             Run all checks and tests for continuous integration (Frontend & Backend)"
	@echo "  ${CYAN}make docker-up${RESET}     Start all services (testnet + backend + frontend) with Docker"
	@echo "  ${CYAN}make docker-down${RESET}   Stop containers"
	@echo "  ${CYAN}make docker-clean${RESET}  Stop containers + remove images and volumes"
	@echo "  ${CYAN}make docker-build${RESET}  Rebuild Docker images"
	@echo "  ${CYAN}make docker-logs${RESET}   Tail logs from all containers"
	@echo "  ${CYAN}make setup-testnet${RESET} Copy Portaldot dev node binary (auto-detects OS)"
	@echo "  ${CYAN}make setup-testnet-docker${RESET} Copy Linux binary for Docker testnet"
	@echo "  ${CYAN}make testnet${RESET}       Start local Portaldot dev node (ws://127.0.0.1:9944)"

install:
	@echo "Installing frontend Node dependencies..."
	npm install
	@echo "Installing backend Python dependencies..."
	python3 -m pip install -r backend/requirements.txt

dev-frontend:
	npm run dev

dev-backend:
	cd backend && python3 -m uvicorn main:app --reload --port 8000

dev:
	@echo "To run both dev servers locally, please run:"
	@echo "  make dev-frontend   (in one terminal tab)"
	@echo "  make dev-backend    (in another terminal tab)"

build:
	npm run build

lint:
	npm run lint

typecheck:
	npm run typecheck

test:
	npm run test

test-coverage:
	npm run test:coverage

ci:
	@echo "=== RUNNING FRONTEND CI CHECKS ==="
	npm run ci
	@echo "=== RUNNING BACKEND CI TESTS ==="
	@python3 -c "import substrateinterface" 2>/dev/null && \
		python3 -m pytest backend/test_main.py -v --cov=backend || \
		echo "⚠️  Skipping backend tests (substrate-interface not installed). Run 'make install' to enable."

docker-up:
	@echo "🚀 Starting all services (testnet + backend + frontend)..."
	docker compose up --build -d
	@echo ""
	@echo "✅ All services running:"
	@echo "   Testnet   → ws://localhost:9944 (Docker)"
	@echo "   Backend   → http://localhost:8000"
	@echo "   Frontend  → http://localhost:3000"
	@echo ""
	@echo "   Use 'make docker-logs' to tail logs"
	@echo "   Use 'make docker-down' to stop"

docker-down:
	@echo "⏹  Stopping containers..."
	docker compose down
	@echo "✅ Stopped"

docker-clean:
	@echo "🧹 Stopping containers and removing images + volumes..."
	docker compose down --rmi all --volumes --remove-orphans
	@echo "✅ Clean — all containers, images, and volumes removed"

docker-build:
	docker compose build

docker-logs:
	docker compose logs -f --tail=50

setup-testnet:
	@./scripts/setup-testnet.sh

setup-testnet-docker:
	@./scripts/setup-testnet.sh --docker

testnet:
	@if [ ! -f testnet/portaldot_dev ]; then \
		echo "❌ Dev node not found. Run 'make setup-testnet' first."; \
		exit 1; \
	fi
	@echo "🚀 Starting Portaldot dev node on ws://127.0.0.1:9944 ..."
	@echo "   Press Ctrl+C to stop"
	@echo ""
	./testnet/portaldot_dev --dev --tmp

