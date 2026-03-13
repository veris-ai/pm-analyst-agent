import json
import logging
import os
import sys
import uuid

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from app.auth import get_tokens, router as auth_router

logging.basicConfig(
    level=logging.INFO,
    format="%(levelname)s %(name)s %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger(__name__)

logging.getLogger("httpx").setLevel(logging.WARNING)
logging.getLogger("httpcore").setLevel(logging.WARNING)
logging.getLogger("google").setLevel(logging.WARNING)

app = FastAPI(title="PM Analyst")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)


@app.get("/health")
async def health():
    return {"status": "healthy", "service": "pm-analyst"}


@app.websocket("/ws/conversations")
async def conversations_ws(websocket: WebSocket, token: str | None = None):
    from app.services.agent_service import get_or_create_session, send_message

    await websocket.accept()

    session_id = str(uuid.uuid4())

    # Build initial session state with Graph + ADO tokens if provided
    state = {}
    if token:
        tokens = get_tokens(token)
        if tokens:
            state.update(tokens)

    await get_or_create_session(session_id, state=state)
    logger.info(f"WS session started: {session_id}")

    try:
        while True:
            raw = await websocket.receive_text()
            try:
                data = json.loads(raw)
                content = data.get("content", "") if isinstance(data, dict) else str(data)
            except (json.JSONDecodeError, ValueError):
                content = raw

            try:
                async for msg in send_message(session_id, content):
                    await websocket.send_json(msg)
            except Exception as e:
                logger.exception(f"Agent error in session {session_id}")
                await websocket.send_json({
                    "content": f"Error: {e}",
                    "type": "error",
                })
    except WebSocketDisconnect:
        logger.info(f"WS session ended: {session_id}")
