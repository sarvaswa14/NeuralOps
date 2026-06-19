# NeuralOps
An autonomous AI incident response platform that detects production issues, investigates them using an LLM-powered agent, performs safe remediation, and generates post-incident reports.
## Live Demo
**Application:** https://neural-ops-gilt.vercel.app
### Demo Credentials
```text
Email:    test@gmail.com
Password: 123456
```
### Try it
1. Log in to the application.
2. Open **Demo Control**.
3. Trigger any failure scenario.
4. Wait for the incident to appear in the **Operations Center**.
5. Open **Agent Trace** to follow the investigation as it happens.
---
## Features
* Detects production anomalies automatically
* Investigates incidents using an AI agent with function calling
* Collects logs, metrics, deployment history, and database information during investigation
* Applies automated fixes when confidence is high
* Escalates incidents when human intervention is required
* Streams investigation progress to the dashboard in real time
* Generates post-mortems after incidents are resolved
* Supports JWT, Google OAuth, and GitHub OAuth authentication
---
## Architecture
```text
                 Target Application
                        │
                        ▼
          Log & Metrics Collection
                        │
                        ▼
        Python Anomaly Detection Engine
                        │
                        ▼
               BullMQ + Redis
                        │
                        ▼
        Node.js Investigation Worker
                        │
                        ▼
     Groq LLM (Llama 3.3 70B)
                        │
                        ▼
                 MongoDB Atlas
                        │
                        ▼
        React Dashboard (Socket.io)
```
---
## Tech Stack
| Layer             | Technology                      |
| ----------------- | ------------------------------- |
| Frontend          | React, Vite                     |
| Backend           | Node.js, Express, Mongoose      |
| AI                | Groq API (Llama 3.3 70B)        |
| Anomaly Detection | Python, NumPy                   |
| Queue             | BullMQ, Redis                   |
| Database          | MongoDB Atlas                   |
| Real-time         | Socket.io                       |
| Authentication    | JWT, Google OAuth, GitHub OAuth |
| Deployment        | Render, Vercel                  |
| Containerization  | Docker, Docker Compose          |
---
## Investigation Workflow
1. Detect an anomaly.
2. Gather logs and system metrics.
3. Investigate using AI tool calls.
4. Identify the likely root cause.
5. Apply a fix if the confidence score is high.
6. Otherwise, escalate the incident.
7. Generate a post-mortem after the investigation is complete.
---
## Agent Tools
* `read_logs`
* `get_metrics`
* `check_deployments`
* `query_database`
* `restart_service`
* `rollback_deployment`
* `scale_service`
* `send_alert`
---