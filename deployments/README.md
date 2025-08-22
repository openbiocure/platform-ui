# OpenBioCure Platform Kubernetes Deployment

This directory contains the Helm chart for deploying the OpenBioCure Platform to Kubernetes.

## Prerequisites

- Kubernetes cluster (1.19+)
- Helm 3.0+
- External PostgreSQL database at `172.16.14.112`
- Docker images built and available in a registry

## Quick Start

### 1. Install the Chart

```bash
# Install with default values
helm install openbiocure-platform ./openbiocure-platform

# Install with custom values
helm install openbiocure-platform ./openbiocure-platform -f custom-values.yaml

# Install in a specific namespace
kubectl create namespace openbiocure
helm install openbiocure-platform ./openbiocure-platform -n openbiocure
```

### 2. Upgrade the Chart

```bash
helm upgrade openbiocure-platform ./openbiocure-platform
```

### 3. Uninstall the Chart

```bash
helm uninstall openbiocure-platform
```

## Configuration

### Database Configuration

The platform uses an external PostgreSQL database at `172.16.14.112`. Make sure the following databases exist:

- `openbiocure_auth` - for the auth service
- `openbiocure_analytics` - for the analytics service  
- `openbiocure_gateway` - for the API gateway

### Secrets

Before deploying, update the secret keys in `values.yaml`:

```yaml
secrets:
  apiGateway:
    secretKey: "your-secure-api-gateway-secret-here"
  authService:
    secretKey: "your-secure-auth-service-secret-here"
  analyticsService:
    secretKey: "your-secure-analytics-service-secret-here"
```

### Custom Values

Create a `custom-values.yaml` file to override default settings:

```yaml
# Example custom values
apiGateway:
  replicaCount: 3
  ingress:
    hosts:
      - host: api.yourdomain.com
        paths:
          - path: /
            pathType: Prefix

frontend:
  ingress:
    hosts:
      - host: app.yourdomain.com
        paths:
          - path: /
            pathType: Prefix

# Enable autoscaling
apiGateway:
  autoscaling:
    enabled: true
    minReplicas: 2
    maxReplicas: 10
```

## Services

The platform consists of four main components:

### 1. API Gateway
- **Port**: 8000
- **Type**: LoadBalancer
- **Purpose**: Routes requests to backend services
- **Ingress**: `api.openbiocure.ai`

### 2. Auth Service
- **Port**: 8001
- **Type**: ClusterIP
- **Purpose**: Handles authentication and user management
- **Database**: `openbiocure_auth`

### 3. Analytics Service
- **Port**: 8002
- **Type**: ClusterIP
- **Purpose**: Processes analytics events and data
- **Database**: `openbiocure_analytics`

### 4. Frontend
- **Port**: 3000
- **Type**: ClusterIP
- **Purpose**: React application UI
- **Ingress**: `app.openbiocure.ai`

## Monitoring

### Check Deployment Status

```bash
# Check all pods
kubectl get pods -l app.kubernetes.io/instance=openbiocure-platform

# Check services
kubectl get services -l app.kubernetes.io/instance=openbiocure-platform

# Check ingress
kubectl get ingress -l app.kubernetes.io/instance=openbiocure-platform
```

### View Logs

```bash
# API Gateway logs
kubectl logs -l app.kubernetes.io/component=api-gateway

# Auth Service logs
kubectl logs -l app.kubernetes.io/component=auth-service

# Analytics Service logs
kubectl logs -l app.kubernetes.io/component=analytics-service

# Frontend logs
kubectl logs -l app.kubernetes.io/component=frontend
```

## Scaling

### Manual Scaling

```bash
# Scale auth service to 5 replicas
kubectl scale deployment openbiocure-platform-auth-service --replicas=5
```

### Auto Scaling

Horizontal Pod Autoscaling (HPA) is enabled by default for all services. Configure thresholds in `values.yaml`:

```yaml
apiGateway:
  autoscaling:
    enabled: true
    minReplicas: 2
    maxReplicas: 10
    targetCPUUtilizationPercentage: 80
    targetMemoryUtilizationPercentage: 80
```

## Troubleshooting

### Common Issues

1. **Pods not starting**: Check if images exist and are accessible
   ```bash
   kubectl describe pod <pod-name>
   ```

2. **Database connection issues**: Verify PostgreSQL connectivity
   ```bash
   kubectl exec -it <pod-name> -- ping 172.16.14.112
   ```

3. **Ingress not working**: Check ingress controller and DNS
   ```bash
   kubectl get ingress
   kubectl describe ingress <ingress-name>
   ```

### Debug Commands

```bash
# Get all resources
kubectl get all -l app.kubernetes.io/instance=openbiocure-platform

# Describe problematic pod
kubectl describe pod <pod-name>

# Check events
kubectl get events --sort-by=.metadata.creationTimestamp

# Port forward for local testing
kubectl port-forward svc/openbiocure-platform-api-gateway 8000:8000
```

## Development

### Local Testing

```bash
# Validate chart
helm lint ./openbiocure-platform

# Dry run installation
helm install openbiocure-platform ./openbiocure-platform --dry-run --debug

# Template rendering
helm template openbiocure-platform ./openbiocure-platform
```

### Building Docker Images

Make sure to build and push your Docker images before deploying:

```bash
# Example for auth service
cd backend/auth-service
docker build -t openbiocure/auth-service:latest .
docker push openbiocure/auth-service:latest
```

## Security Considerations

1. **Secrets Management**: Use Kubernetes secrets or external secret management
2. **Network Policies**: Implement network policies to restrict traffic
3. **RBAC**: Configure proper role-based access control
4. **Image Security**: Scan images for vulnerabilities
5. **TLS**: Enable TLS for all external communications

## Contributing

When modifying the chart:

1. Update version in `Chart.yaml`
2. Test changes with `helm lint` and `helm template`
3. Update this README if needed
4. Test deployment in development environment
