-- Database initialization for OpenBioCure microservices
-- Run this script to create the required databases

-- Create databases for each microservice
CREATE DATABASE IF NOT EXISTS openbiocure_auth;
CREATE DATABASE IF NOT EXISTS openbiocure_analytics;
CREATE DATABASE IF NOT EXISTS openbiocure_platform;

-- Create extensions for UUID support
\c openbiocure_auth;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

\c openbiocure_analytics;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

\c openbiocure_platform;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Grant permissions (adjust as needed for production)
GRANT ALL PRIVILEGES ON DATABASE openbiocure_auth TO postgres;
GRANT ALL PRIVILEGES ON DATABASE openbiocure_analytics TO postgres;
GRANT ALL PRIVILEGES ON DATABASE openbiocure_platform TO postgres;
