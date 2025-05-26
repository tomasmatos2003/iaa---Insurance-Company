from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Any
import json
import os
from dotenv import load_dotenv
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.backends import default_backend

load_dotenv()

app = FastAPI()

class JSONRequest(BaseModel):
    data: Any  # Accept arbitrary JSON

def load_private_key():
    with open(os.path.join("keys", "private_key.pem"), "rb") as f:
        private_key = serialization.load_pem_private_key(
            f.read(),
            password=os.getenv("PASSPHRASE").encode() if os.getenv("PASSPHRASE") else None,
            backend=default_backend()
        )
    return private_key

private_key = load_private_key()

@app.post("/sign-json")
async def sign_json(request: JSONRequest):
    try:
        # Deterministic JSON serialization
        json_bytes = json.dumps(request.data, sort_keys=True, separators=(',', ':')).encode('utf-8')

        # Hash the JSON bytes
        digest = hashes.Hash(hashes.SHA256(), backend=default_backend())
        digest.update(json_bytes)
        hashed = digest.finalize()

        # Sign the hash
        signature = private_key.sign(
            hashed,
            padding.PSS(
                mgf=padding.MGF1(hashes.SHA256()),
                salt_length=padding.PSS.MAX_LENGTH
            ),
            hashes.SHA256()
        )

        return {"signature": signature.hex()}

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Signing failed: {str(e)}")
