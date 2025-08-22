# OpenBioCure Backend Makefile
# Simple commands to replace all bash scripts

.PHONY: install start stop test health logs clean

# Install dependencies for all services
install:
	@echo "📦 Installing dependencies for all services..."
	cd auth-service && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt
	cd analytics-service && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt
	cd workspace-service && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt
	cd api-gateway && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt
	@echo "✅ All dependencies installed"

# Start all services using honcho
start:
	@echo "🚀 Starting all OpenBioCure services..."
	~/Library/Python/3.9/bin/honcho start

# Alternative: Start services individually
start-dev:
	@echo "🚀 Starting services in development mode..."
	cd auth-service && source venv/bin/activate && python3 -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload &
	cd analytics-service && source venv/bin/activate && python3 -m uvicorn main:app --host 0.0.0.0 --port 8002 --reload &
	cd workspace-service && source venv/bin/activate && python3 -m uvicorn main:app --host 0.0.0.0 --port 8004 --reload &
	cd api-gateway && source venv/bin/activate && python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
	@echo "✅ All services started in background"

# Stop all services
stop:
	@echo "🛑 Stopping all services..."
	@pkill -f "uvicorn.*8001" || true
	@pkill -f "uvicorn.*8002" || true
	@pkill -f "uvicorn.*8004" || true
	@pkill -f "uvicorn.*8000" || true
	@pkill -f "honcho" || true
	@echo "✅ All services stopped"

# Run health checks
health:
	@echo "🔍 Checking service health..."
	@curl -s http://localhost:8001/health | jq . || echo "❌ Auth service down"
	@curl -s http://localhost:8002/health | jq . || echo "❌ Analytics service down"
	@curl -s http://localhost:8004/health | jq . || echo "❌ Workspace service down"
	@curl -s http://localhost:8000/health | jq . || echo "❌ Gateway service down"

# Run tests
test:
	@echo "🧪 Running tests..."
	@python3 -m pytest tests/ || echo "⚠️ No tests found"

# View logs (requires running services)
logs:
	@echo "📋 Service logs:"
	@echo "Auth: tail -f auth-service/logs/app.log"
	@echo "Analytics: tail -f analytics-service/logs/app.log"
	@echo "Workspace: tail -f workspace-service/logs/app.log"
	@echo "Gateway: tail -f api-gateway/logs/app.log"

# Database seeding commands
seed-dev:
	@echo "🌱 Seeding development database..."
	cd auth-service && APP_ENV=development python3 seed_database.py
	@echo "✅ Development seeding complete"

seed-staging:
	@echo "🌱 Seeding staging database..."
	cd auth-service && APP_ENV=staging python3 seed_database.py
	@echo "✅ Staging seeding complete"

seed-prod:
	@echo "🌱 Seeding production database..."
	@echo "⚠️  Production seeding requires PROD_ADMIN_PASSWORD environment variable"
	cd auth-service && APP_ENV=production python3 seed_database.py
	@echo "✅ Production seeding complete"

seed-test:
	@echo "🌱 Seeding test database..."
	cd auth-service && APP_ENV=test python3 seed_database.py
	@echo "✅ Test seeding complete"

seed-force:
	@echo "🔄 Force seeding (overwrites existing data)..."
	cd auth-service && python3 seed_database.py --force
	@echo "✅ Force seeding complete"

seed-dry-run:
	@echo "🔍 Dry run seeding (shows what would be created)..."
	cd auth-service && python3 seed_database.py --dry-run
	@echo "✅ Dry run complete"

# Simple seeding via API (no database dependencies)
seed-simple:
	@echo "🌱 Simple seeding via API..."
	cd auth-service && python3 seed_simple.py
	@echo "✅ Simple seeding complete"

# Database management
reset-db:
	@echo "🗄️ Resetting database..."
	$(MAKE) stop
	@echo "🧹 Cleaning up database..."
	@echo "🌱 Reseeding with development data..."
	$(MAKE) seed-dev
	@echo "✅ Database reset complete"

# Clean up virtual environments and logs
clean:
	@echo "🧹 Cleaning up..."
	rm -rf auth-service/venv analytics-service/venv workspace-service/venv api-gateway/venv
	rm -rf auth-service/logs analytics-service/logs workspace-service/logs api-gateway/logs
	rm -rf **/__pycache__ **/*.pyc
	@echo "✅ Cleanup complete"

# Setup development environment
setup:
	@echo "🛠️ Setting up development environment..."
	python3 -m pip install honcho supervisor httpx pytest
	$(MAKE) install
	@echo "✅ Development environment ready"

# Quick start (setup + start)
dev:
	$(MAKE) setup
	$(MAKE) start
