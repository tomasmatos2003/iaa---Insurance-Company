from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Any
import json
import os
from datetime import datetime, timedelta
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.backends import default_backend
import base64
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

KEYS_DIR = "keys"
PRIVATE_KEY_FILE = os.path.join(KEYS_DIR, "private_key.pem")

class JSONRequest(BaseModel):
    user: str
    credential: Any  

def load_private_key():
    passphrase = os.getenv("PASSPHRASE")
    if not passphrase:
        raise Exception("PASSPHRASE env var is not set")
    passphrase_bytes = passphrase.encode()

    with open(PRIVATE_KEY_FILE, "rb") as f:
        private_key = serialization.load_pem_private_key(
            f.read(),
            password=passphrase_bytes,
            backend=default_backend()
        )
    return private_key


did_key = os.getenv("DID_KEY")  

def sign_json_ld(vc_json: dict) -> dict:
    private_key = load_private_key()
    
    json_bytes = json.dumps(vc_json, sort_keys=True, separators=(',', ':')).encode('utf-8')

    signature = private_key.sign(
        json_bytes,
        ec.ECDSA(hashes.SHA256())
    )

    proof_value = base64.urlsafe_b64encode(signature).decode('utf-8').rstrip("=")

    proof = {
        "type": "DataIntegrityProof",
        "created": datetime.utcnow().replace(microsecond=0).isoformat() + "Z",
        "verificationMethod": f"{did_key}#{did_key}" if did_key else "did:example:123#key-1",
        "cryptosuite": "ecdsa-rdfc-2019",
        "proofPurpose": "assertionMethod",
        "proofValue": proof_value
    }

    signed_vc = vc_json.copy()
    signed_vc["proof"] = proof
    return signed_vc

@app.post("/issue_vc")
async def issue_vc(request: JSONRequest):
    try:
        vc = request.credential
        if "issuer" not in vc:
            vc["issuer"] = did_key or "did:example:123"

        now = datetime.utcnow()
        vc["issuanceDate"] = now.isoformat() + "Z"
        vc["expirationDate"] = (now + timedelta(days=365)).isoformat() + "Z"

        
        signed_vc = sign_json_ld(vc)

        return signed_vc

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Signing failed: {str(e)}")
