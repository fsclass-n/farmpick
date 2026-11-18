from fastapi import APIRouter, Depends
from pydantic import BaseModel

from ..mock_data import PESTS
from ..security import get_current_user
from ..services import gemini_service

router = APIRouter(prefix="/api/chat", tags=["chat"])


class ChatRequest(BaseModel):
    message: str
    history: list[dict] = []


@router.post("/")
async def chat(body: ChatRequest, user: dict = Depends(get_current_user)):
    reply, sources = await gemini_service.chat(body.message, PESTS)
    return {"reply": reply, "sources": sources}
