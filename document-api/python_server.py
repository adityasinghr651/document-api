from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

# Input ka model define karna
class InputText(BaseModel):
    text: str

@app.post("/process")
async def process_text(data: InputText):
    # Simple logic: jo text aaya use uppercase me kar do
    return {"processed": data.text.upper()}
