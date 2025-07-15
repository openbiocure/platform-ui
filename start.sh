#!/bin/bash

# Source bash-lib
export BASH__PATH="/opt/bash-lib"

source "$BASH__PATH/lib/init.sh"

import console
# Import service module
import service

# Start the service
service.start api_server "npm run backend" \
  --respawn \
  --background \
  --max-restarts 5 \
  --restart-delay 10 \
  --log-file "/var/log/api_server.log" \
  --pid-file "/var/run/api_server.pid"

console.success "API server started. Check logs: /var/log/api_server.log"
