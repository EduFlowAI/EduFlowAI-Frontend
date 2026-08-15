# deploy-aws.ps1 - Automated Build & S3 Sync for EduFlowAI Frontend
param(
    [string]$BucketName = "eduflowai-frontend-823916750998",
    [string]$DistributionId = "EFI699XJ1J2VR"
)

Write-Host "🚀 Building EduFlowAI Angular Frontend for Production..." -ForegroundColor Green
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed. Aborting deployment." -ForegroundColor Red
    exit 1
}

Write-Host "📦 Syncing static assets to S3 bucket: s3://$BucketName..." -ForegroundColor Green
aws s3 sync dist/EduFlowAI-Frontend/browser s3://$BucketName --delete

if ($DistributionId) {
    Write-Host "🔄 Invalidating CloudFront cache for Distribution: $DistributionId..." -ForegroundColor Green
    aws cloudfront create-invalidation --distribution-id $DistributionId --paths "/*"
}

Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
Write-Host "🌐 Live URL: https://d2uem9lvrop6gq.cloudfront.net" -ForegroundColor Cyan
