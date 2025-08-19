# OpenBioCure Platform Frontend Deployment Makefile

# Configuration
BUILD_DIR = build
REMOTE_HOST = 172.16.13.179
REMOTE_PATH = /opt/obc-platform
SSH_USER = root

# Default target
.PHONY: help
help:
	@echo "Available targets:"
	@echo "  build     - Build the React application"
	@echo "  deploy    - Build and deploy to nginx server"
	@echo "  clean     - Clean build artifacts"
	@echo "  help      - Show this help message"

# Build the React application
.PHONY: build
build:
	@echo "Building React application..."
	npm run build
	@echo "Build completed successfully!"

# Deploy to nginx server
.PHONY: deploy
deploy: build
	@echo "Deploying to nginx server at $(REMOTE_HOST)..."
	rsync -avz --delete \
		--exclude='.git*' \
		--exclude='node_modules' \
		--exclude='*.log' \
		--exclude='.env*' \
		$(BUILD_DIR)/ $(SSH_USER)@$(REMOTE_HOST):$(REMOTE_PATH)/
	@echo "Deployment completed successfully!"
	@echo "Application deployed to: $(REMOTE_HOST):$(REMOTE_PATH)"

# Clean build artifacts
.PHONY: clean
clean:
	@echo "Cleaning build artifacts..."
	rm -rf $(BUILD_DIR)
	@echo "Clean completed!"

# Quick deploy without rebuilding (if build already exists)
.PHONY: deploy-only
deploy-only:
	@echo "Deploying existing build to nginx server at $(REMOTE_HOST)..."
	rsync -avz --delete \
		--exclude='.git*' \
		--exclude='node_modules' \
		--exclude='*.log' \
		--exclude='.env*' \
		$(BUILD_DIR)/ $(SSH_USER)@$(REMOTE_HOST):$(REMOTE_PATH)/
	@echo "Deployment completed successfully!"
	@echo "Application deployed to: $(REMOTE_HOST):$(REMOTE_PATH)"

# Check deployment status
.PHONY: status
status:
	@echo "Checking deployment status..."
	@ssh $(SSH_USER)@$(REMOTE_HOST) "ls -la $(REMOTE_PATH)/"
	@echo "Deployment status check completed!"
