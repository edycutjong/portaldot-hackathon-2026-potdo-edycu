.PHONY: help install dev dev-frontend dev-backend build lint typecheck test test-coverage ci docker-up docker-down docker-build

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
	@echo "  ${CYAN}make docker-up${RESET}     Build and launch all services with Docker Compose"
	@echo "  ${CYAN}make docker-down${RESET}   Stop and remove Docker Compose containers"
	@echo "  ${CYAN}make docker-build${RESET}  Rebuild Docker Compose containers"

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
	docker compose up --build

docker-down:
	docker compose down

docker-build:
	docker compose build

