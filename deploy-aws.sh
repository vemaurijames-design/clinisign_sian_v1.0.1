#!/bin/bash
# ================================================================
# CliniSign - Script de Deploy en AWS (ECS + S3 + CloudFront)
# Uso: bash deploy-aws.sh [staging|production]
# ================================================================

set -e

ENV=${1:-staging}
AWS_REGION=${AWS_REGION:-us-east-1}
ECR_REGISTRY=${ECR_REGISTRY:-"<TU_ACCOUNT_ID>.dkr.ecr.${AWS_REGION}.amazonaws.com"}
ECR_REPO_BACKEND="clinisign-backend"
S3_BUCKET=${S3_BUCKET:-"clinisign-frontend-${ENV}"}
CLOUDFRONT_ID=${CLOUDFRONT_ID:-"<TU_CLOUDFRONT_DISTRIBUTION_ID>"}
IMAGE_TAG=$(git rev-parse --short HEAD)

echo "=== CliniSign Deploy ==="
echo "Entorno: $ENV"
echo "Tag:     $IMAGE_TAG"
echo "Región:  $AWS_REGION"
echo "========================"

# ── 1. Login a ECR ──────────────────────────────────────────
echo "[1/5] Autenticando en AWS ECR..."
aws ecr get-login-password --region $AWS_REGION | \
  docker login --username AWS --password-stdin $ECR_REGISTRY

# ── 2. Build y Push Backend ──────────────────────────────────
echo "[2/5] Construyendo imagen del backend..."
cd clinisign-backend
docker build -t $ECR_REPO_BACKEND:$IMAGE_TAG .
docker tag $ECR_REPO_BACKEND:$IMAGE_TAG $ECR_REGISTRY/$ECR_REPO_BACKEND:$IMAGE_TAG
docker tag $ECR_REPO_BACKEND:$IMAGE_TAG $ECR_REGISTRY/$ECR_REPO_BACKEND:latest

echo "     Publicando en ECR..."
docker push $ECR_REGISTRY/$ECR_REPO_BACKEND:$IMAGE_TAG
docker push $ECR_REGISTRY/$ECR_REPO_BACKEND:latest
cd ..

# ── 3. Build Frontend ────────────────────────────────────────
echo "[3/5] Construyendo frontend React..."
cd clinisign-frontend
VITE_API_URL="https://api.siansalud.com/api" npm run build

# ── 4. Deploy Frontend a S3 ──────────────────────────────────
echo "[4/5] Publicando frontend en S3..."
aws s3 sync dist/ s3://$S3_BUCKET --delete --cache-control "public,max-age=31536000,immutable"
# index.html sin cache
aws s3 cp dist/index.html s3://$S3_BUCKET/index.html \
  --cache-control "no-cache,no-store,must-revalidate" \
  --content-type "text/html"
cd ..

# ── 5. Invalidar CloudFront ──────────────────────────────────
echo "[5/5] Invalidando caché de CloudFront..."
aws cloudfront create-invalidation \
  --distribution-id $CLOUDFRONT_ID \
  --paths "/*"

echo ""
echo "=== Deploy completado ==="
echo "Frontend: https://$(aws cloudfront get-distribution --id $CLOUDFRONT_ID --query 'Distribution.DomainName' --output text)"
echo "Backend: Actualizar ECS Task Definition con imagen: $ECR_REGISTRY/$ECR_REPO_BACKEND:$IMAGE_TAG"
echo "========================"
