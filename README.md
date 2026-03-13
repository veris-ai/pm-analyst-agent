# PM Analyst Agent

AI-powered assistant that converts meeting transcripts and notes into structured project management artifacts — Epics, Features, and User Stories — and pushes them to Azure DevOps.

Built with [Google ADK](https://google.github.io/adk-docs/) + FastAPI (backend) and Next.js (frontend).

## What It Does

1. **Pulls meeting content** from Microsoft Teams transcripts or OneDrive files
2. **Summarizes** key discussion points, decisions, and action items
3. **Identifies gaps** by comparing against Epic/Feature brief templates
4. **Asks clarifying questions** one at a time to fill in missing details
5. **Generates work items** (Epics, Features, User Stories) following organizational templates
6. **Creates items in Azure DevOps** with proper parent-child hierarchy

## Project Structure

```
backend/          Python — FastAPI server + Google ADK agent
pm-assistant/     Next.js — Chat-based frontend UI
.veris/           Veris sandbox configuration
```

## Quick Start

### 1. Configure environment

```bash
cp .env.example backend/.env
```

Edit `backend/.env` — at minimum you need an LLM provider:

| Variable | Required | Description |
|---|---|---|
| `GOOGLE_API_KEY` | Yes* | Google AI Studio key (*or* use Vertex AI below) |
| `GCP_PROJECT` | Yes* | Vertex AI project (*or* use API key above) |
| `GCP_LOCATION` | No | Vertex AI region (default `global`) |
| `ADK_MODEL` | No | Model name (default `gemini-2.5-flash`) |
| `PORT` | No | Backend port (default `8000`) |
| `FRONTEND_URL` | No | Frontend URL (default `http://localhost:3000`) |
| `MS_CLIENT_ID` | No | Entra ID app client ID |
| `MS_CLIENT_SECRET` | No | Entra ID app client secret |
| `MS_TENANT_ID` | No | Entra ID tenant ID |
| `ADO_ORG` | No | Azure DevOps organization |
| `ADO_PROJECT` | No | Azure DevOps project |

### 2. Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -e .
uvicorn app.main:app --reload
```

### 3. Frontend

```bash
cd pm-assistant
npm install
```

Create `pm-assistant/.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

```bash
npm run dev
```

### 4. Open the app

Visit [http://localhost:3000](http://localhost:3000)

## Microsoft Integration (Optional)

To pull Teams meeting transcripts and OneDrive files:

1. Register an app in [Microsoft Entra ID](https://entra.microsoft.com) with redirect URI `http://localhost:<PORT>/auth/microsoft/callback`
2. Set `MS_CLIENT_ID`, `MS_CLIENT_SECRET`, and `MS_TENANT_ID` in `backend/.env`
3. Sign in via the app's Microsoft login button

## Azure DevOps Integration (Optional)

To create and manage work items in ADO:

1. Ensure the Entra ID app has the `Azure DevOps (user_impersonation)` API permission
2. Set `ADO_ORG` and `ADO_PROJECT` in `backend/.env`
3. Re-authenticate to consent to the new scope
4. Ask the agent to create work items — it will push Epics, Features, and User Stories with proper hierarchy

## Running on Veris

This agent includes a `.veris/` configuration for running in a [Veris](https://veris.ai) sandbox. The `veris.yaml` defines service mocks for Microsoft Graph, Azure DevOps, and Microsoft Auth so you can test the full flow without real credentials.
