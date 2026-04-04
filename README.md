# Nexus-Green

## Problem Statement
Rapid urbanization in Maharashtra, particularly in cities like Nagpur, has led to severe urban heat islands, traffic congestion, and inefficient energy management. Nexus-Green provides a real-time, AI-driven smart city dashboard to predict and mitigate these urban issues for the citizens and governance of Maharashtra.

## AI Component
- **Gemini API:** Used for advanced reasoning and generating real-time actionable advisories based on environmental and traffic metrics.
- **Google AI SDK:** Integrated via `@ai-sdk/google` to streamline the multimodal processing and response generation within our Next.js backend.
- **Google Vision (via Gemini Multimodal):** Used to analyze uploaded field reports and images of urban issues.

## Architecture Diagram
```mermaid
graph TD;
    User([Citizens/Govt]) --> |Mobile App| Flutter;
    Flutter --> |API Calls| CloudRun[Google Cloud Run (Next.js API)];
    CloudRun <--> |Real-time Sync| Firebase[Google Firebase (Firestore/Auth)];
    CloudRun <--> |Generative AI| Gemini[Gemini API / Vertex AI];
    CloudRun <--> |Metrics| ExternalAPIs[Weather/Traffic APIs];
```

## Deployment URL
[Deployment coming soon on GCP Cloud Run]

## Implementation Details
The mobile app is built with Flutter for cross-platform accessibility. The backend is a Next.js application containerized via Docker and deployed on Google Cloud Run for scalable, serverless execution. Firebase serves as the primary Google Managed Database for real-time state management across the dashboard and app. The Vercel AI SDK intelligently orchestrates requests to the Gemini API.

## GIT Hub
Public GIT HUB URL: https://github.com/your-username/nexus-green
