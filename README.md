# Nexus-Green: Real-time Urban Heat & Traffic Intelligence Dashboard

### 3. Project Documentation

| Section | Description |
| :--- | :--- |
| **Project Title** | **Nexus-Green: Real-time Urban Microclimate Intelligence & Predictive Heat Mitigation Engine** |
| **Problem Statement** | Rapid urbanization in Maharashtra’s tier-1 and tier-2 cities, specifically **Nagpur**, has led to the critical **Urban Heat Island (UHI)** effect. High-density concrete surfaces, heavy traffic exhaust, and a lack of ecological green corridors cause localized Temperatures to spike up to **6°C higher** than the city average in vulnerable wards. This creates hazardous living conditions and increases the risk of mortality during heatwaves. Municipal bodies currently lack **ward-level, real-time visibility** to proactively deploy cooling units or issue hyper-localized public health warnings. |
| **AI Component** | Our solution utilizes **Google Gemini 1.5 Flash** to perform two specialized intelligence functions: <br/> 1. **Multimodal Street Analysis:** Incident Commanders upload field photographs which are parsed by Gemini's vision capability to detect heat-reflective materials (asphalt, dark concrete) and identify safe "Natural Cooling Zones." <br/> 2. **Reasoning-based Advisories:** Using the **Vercel AI SDK**, Gemini analyzes the live-calculated gap between current temperatures and the 5-year historical maximums. It generates unique, 3-point **Actionable Emergency Plans** for each ward rather than generic city-wide alerts. |
| **Architecture Diagram** | ```mermaid <br/> graph TD; <br/> User([Incident Commander]) --> |Secure Portal - Firebase Auth| Frontend[Next.js Dashboard UI]; <br/> Frontend --> |Containerized API - Cloud Run| Backend[Node.js Intelligence Engine]; <br/> Backend <--> |Multimodal Vision & Reasoning| Gemini[Google Gemini 1.5 Flash]; <br/> Backend <--> |Local Data Fallback| Storage[Firebase Firestore]; <br/> Backend <--> |Sensor Ingestion| APIs[OpenMeteo & Traffic Metrics]; <br/> Backend --> |Trigger Protocol| Output([Live Field Agent Dispatch]); <br/> ``` |
| **Deployment URL** | [Your Google Cloud Run URL will go here] |
| **Implementation Details** | The platform is built on a **Next.js** framework and containerized with **Docker** for deployment on **Google Cloud Run** to ensure serverless, scalable execution. We implemented a deterministic microclimate algorithm that models three distinct city zones: **Industrial (+2.5°C penalty)**, **Urban (Baseline)**, and **Green (-1.8°C cooling)**. By integrating the AI reasoning layer directly with this 7-day micro-forecast, the system can predict "Heat Danger Thresholds" before they occur, allowing governance to move from reactive crisis management to pre-emptive city cooling. |
| **GIT Hub** | https://github.com/amanhatmode1/nexus-green |

---
*Created for the Maharashtra Smart City Hackathon 2026*
