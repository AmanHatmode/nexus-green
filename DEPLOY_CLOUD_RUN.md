# 🚀 Deploy Nexus-Green to Google Cloud Run

## Prerequisites

1. **Google Cloud CLI installed** — [Install gcloud](https://cloud.google.com/sdk/docs/install)
2. **Docker Desktop running** on your machine
3. A **Google Cloud project** (create one at [console.cloud.google.com](https://console.cloud.google.com))

---

## Step 1 — Authenticate & Set Project

```powershell
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

> Replace `YOUR_PROJECT_ID` with your actual GCP project ID (e.g. `nexus-green-prod`).

---

## Step 2 — Enable Required APIs

```powershell
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com
```

---

## Step 3 — Deploy with a Single Command (Recommended)

This is the easiest path — Cloud Build handles everything remotely:

```powershell
cd "C:\Users\amanh\OneDrive\Desktop\hackathon\nexus-green-api"

gcloud run deploy nexus-green `
  --source . `
  --region asia-south1 `
  --platform managed `
  --allow-unauthenticated `
  --port 3000 `
  --memory 1Gi `
  --build-arg NEXT_PUBLIC_SUPABASE_URL="YOUR_SUPABASE_URL" `
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY" `
  --set-env-vars GOOGLE_GENERATIVE_AI_API_KEY="YOUR_GEMINI_API_KEY"
```

> `--source .` tells gcloud to upload your source and run Cloud Build automatically.

When prompted `Allow unauthenticated invocations? (y/N)` → type **y**.

---

## Step 4 — Handle `google-credentials.json` (Important!)

Your app uses `GOOGLE_APPLICATION_CREDENTIALS` pointing to a local file. Cloud Run needs this handled differently.

### Option A — Use Secret Manager (Recommended for production)

```powershell
# 1. Create the secret from your JSON file
gcloud secrets create google-credentials --data-file="google-credentials.json"

# 2. Grant Cloud Run access to the secret
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:YOUR_PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

# 3. Mount the secret as a volume or env var on redeploy
gcloud run services update nexus-green `
  --region asia-south1 `
  --update-secrets=/app/google-credentials.json=google-credentials:latest
```

### Option B — Simplest (if only Gemini API key is needed)
If your app only calls the Gemini API via `GOOGLE_GENERATIVE_AI_API_KEY` and doesn't use Google Cloud SDK APIs directly, you can simply ignore `GOOGLE_APPLICATION_CREDENTIALS` — the API key already provides access.

---

## Step 5 — Get Your Live URL

After deployment completes, you'll see output like:

```
Service URL: https://nexus-green-XXXX-as.a.run.app
```

That's your public URL! ✅

---

## Alternative: Manual Docker Push (if `--source` fails)

```powershell
# Configure Docker to use gcloud auth
gcloud auth configure-docker asia-south1-docker.pkg.dev

# Build the image locally
docker build `
  --build-arg NEXT_PUBLIC_SUPABASE_URL="YOUR_SUPABASE_URL" `
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY" `
  -t asia-south1-docker.pkg.dev/YOUR_PROJECT_ID/nexus-green/app:latest .

# Create Artifact Registry repo (first time only)
gcloud artifacts repositories create nexus-green `
  --repository-format=docker `
  --location=asia-south1

# Push the image
docker push asia-south1-docker.pkg.dev/YOUR_PROJECT_ID/nexus-green/app:latest

# Deploy from the image
gcloud run deploy nexus-green `
  --image asia-south1-docker.pkg.dev/YOUR_PROJECT_ID/nexus-green/app:latest `
  --region asia-south1 `
  --allow-unauthenticated `
  --port 3000 `
  --memory 1Gi `
  --set-env-vars GOOGLE_GENERATIVE_AI_API_KEY="YOUR_GEMINI_API_KEY"
```

---

## Common Issues & Fixes

| Error | Fix |
|---|---|
| `Build failed: npm ci` | Check `.dockerignore` — ensure `package-lock.json` is NOT excluded |
| `Cannot find module` at runtime | Needs `output: "standalone"` in `next.config.ts` ✅ (already set) |
| Port mismatch errors | Your Dockerfile sets `PORT=3000` which overrides Cloud Run's default 8080 ✅ |
| `google-credentials.json` not found | Use Secret Manager (see Step 4) |
| Cold start / request timeouts | Add `--min-instances 1` flag to keep one instance warm |
| `403 Forbidden` on the URL | Re-run deploy and confirm `--allow-unauthenticated` is set |
