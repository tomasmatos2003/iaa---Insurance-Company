from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from pymongo import MongoClient
from common.hashing import Hash
from common.oauth import get_current_user
from common.jwttoken import create_access_token
from fastapi import Depends, HTTPException, status
from models.schemas import User, Login, Token, TokenData, Pre_InsuranceData    
from datetime import datetime, timedelta
from fastapi.encoders import jsonable_encoder
import requests
import qrcode
import io
import base64
from fastapi.responses import JSONResponse
import json
from uuid import uuid4
import random
from typing import List, Optional

import base58
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives import hashes
from cryptography.exceptions import InvalidSignature

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    # allow_origins=["http://localhost:3000"],  # or your frontend port
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = MongoClient("mongodb://localhost:27017")
db = client["User_seguradora"]
# insurance_db = client["Insurances"]


@app.post('/register')
def create_user(request:User):
   hashed_pass = Hash.bcrypt(request.password)
   user_object = dict(request)
   user_object["password"] = hashed_pass
   
   user_id = db["users"].insert_one(user_object)
   
   return {"res":"created"}

@app.post('/login')
def login(request:OAuth2PasswordRequestForm = Depends()):

    user = db["users"].find_one({"username":request.username})
    if not user:
       raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if not Hash.verify(user["password"],request.password):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    access_token = create_access_token(data={"sub": user["username"]})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/get_my_insurance", response_model=Optional[dict])
def get_user_insurance_credentials(current_user: TokenData = Depends(get_current_user)):
    try:

        user_did = f"did:insurance:{current_user.username}"
    
        last_credential = db["insurance_credentials"].find_one(
            {"credentialSubject.id": user_did},
            sort=[("_id", -1)]
        )
        print(last_credential)

        if not last_credential:
            return None 

        # Convert ObjectId to string
        last_credential["_id"] = str(last_credential["_id"])

        # Generate QR code for the last credential JSON
        signed_vc_json = json.dumps(last_credential)
        qr = qrcode.QRCode(version=1, box_size=10, border=4)
        qr.add_data(signed_vc_json)
        qr.make(fit=True)

        img = qr.make_image(fill='black', back_color='white')
        buffered = io.BytesIO()
        img.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode('utf-8')
        qr_code_data_uri = f"data:image/png;base64,{img_str}"

        return {
            "credential": last_credential,
            "qr_code": qr_code_data_uri
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    
def get_public_key_from_did_key(did_key: str):
    if not did_key.startswith("did:key:z"):
        raise ValueError("Unsupported DID key format")

    base58_part = did_key[len("did:key:z"):]
    decoded = base58.b58decode(base58_part)

    if not decoded.startswith(b'\x12\x00'):
        raise ValueError("Unsupported or incorrect multicodec prefix for P-256")

    pub_bytes = decoded[2:]  # Remove multicodec prefix

    try:
        public_key = ec.EllipticCurvePublicKey.from_encoded_point(ec.SECP256R1(), pub_bytes)
    except ValueError as e:
        raise ValueError(f"Failed to load public key: {e}")

    return public_key


def verify_vc_signature(vc):

    proof = vc.get("proof")
    issuer = vc.get("issuer")

    if not proof or not issuer:
        print("Missing proof or issuer.")
        return {"error": "Verificação falhou"}, 400

    try:
        # Prepare canonicalized VC (remove proof and internal fields)
        vc_to_verify = {k: v for k, v in vc.items() if k != "proof" and not k.startswith("_")}
        data_to_verify = json.dumps(vc_to_verify, separators=(',', ':'), sort_keys=True).encode("utf-8")
        # data_to_verify = b"tampered data"
        # Decode base64 signature
        proof_value_b64 = proof.get("proofValue")
        padding = '=' * ((4 - len(proof_value_b64) % 4) % 4)
        signature = base64.urlsafe_b64decode(proof_value_b64 + padding)

        # Load public key from DID
        public_key = get_public_key_from_did_key(issuer)
        
        public_key.verify(signature, data_to_verify, ec.ECDSA(hashes.SHA256()))
        return True

    except Exception as e:
        print("Signature verification failed:", str(e))
        return {"error": "Verificação falhou"}, 400

    
@app.post("/insert_data")
def insert_insurance_data(
    request: Pre_InsuranceData
):  
    # Since vehicle_vc and driving_license_vc are already dicts, no need to .dict()
    vehicle_vc = request.AutomobileCredential
    driving_license_vc = request.DrivingLicenseCredential

    result = verify_vc_signature(vehicle_vc)
    if result is not True:
        return JSONResponse(
            content={
                "error": "AutomobileCredential verification failed",
            },
            status_code=400
        )


    result = verify_vc_signature(driving_license_vc)
    if not verify_vc_signature(driving_license_vc):
        return JSONResponse(
            content={
                "error": "DrivingLicenseCredential verification failed",
            },
            status_code=400
        )
    
    # Random insurance info generation
    policy_number = f"POL{random.randint(1000000000, 9999999999)}"
    insured_value = f"{random.randint(5000, 50000)} EUR"
    coverage_options = ["Liability", "Collision", "Theft", "Fire", "Glass", "NaturalDisaster"]
    coverage = random.sample(coverage_options, k=random.randint(2, 4))
    valid_from_date = datetime.utcnow().date()
    valid_until_date = valid_from_date + timedelta(days=365)
    provider = random.choice(["ABC Insurance Co.", "SafeDrive Ltd.", "AutoShield Inc."])
    insured_person_name = driving_license_vc["credentialSubject"]["givenName"] + " " + driving_license_vc["credentialSubject"]["familyName"]

    insurance_info = {
        "policyNumber": policy_number,
        "insuredValue": insured_value,
        "coverage": coverage,
        "validFrom": str(valid_from_date),
        "validUntil": str(valid_until_date),
        "provider": provider,
        "insuredPersonName": insured_person_name
    }
    username = driving_license_vc["credentialSubject"]["id"].split(":")[2]

    # Build credential subject
    credential_subject = {
        "id": "did:insurance:"+ username,
        "insurancePolicy": {
            "policyNumber": insurance_info["policyNumber"],
            "insuredValue": insurance_info["insuredValue"],
            "coverage": insurance_info["coverage"],
            "validFrom": insurance_info["validFrom"],
            "validUntil": insurance_info["validUntil"],
            "provider": insurance_info["provider"],
            "insuredPerson": {
                "name": insurance_info["insuredPersonName"],
                "licenseReference": driving_license_vc["id"]
            },
            "insuredVehicle": {
                "plateNumber": vehicle_vc["credentialSubject"]["vehicle"]["plateNumber"],
                "vin": vehicle_vc["credentialSubject"]["vehicle"]["vin"],
                "vehicleReference": vehicle_vc["id"]
            }
        }
    }

    vc_id = f"urn:uuid:{uuid4()}"
    vc_data = {
        "@context": [
            "https://www.w3.org/2018/credentials/v1",
            "https://www.w3.org/2018/credentials/examples/v1"
        ],
        "id": vc_id,
        "type": ["VerifiableCredential", "InsuranceCredential"],
        "credentialSubject": credential_subject
    }

    data_to_sign = {
        "user": username,
        "credential": vc_data
    }

    try:
        signing_response = requests.post(
            "http://127.0.0.1:8001/issue_vc",
            json=data_to_sign,
            timeout=5
        )
        signing_response.raise_for_status()
        signed_vc = signing_response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Signing service error: {str(e)}")

    result = db["insurance_credentials"].insert_one(signed_vc)
    signed_vc["_id"] = str(result.inserted_id)
    print(signed_vc)
    return {
        "message": "Insurance Verifiable Credential issued successfully.",
        "submitted_by": username,
        "vc": signed_vc
    }


@app.get("/generate_qrcode")
def generate_qrcode(current_user: TokenData = Depends(get_current_user)):
    try:
        data = {
            "url": "http://192.168.1.105:8000/insert_data",
            "requiredVCs": ["AutomobileCredential", "DrivingLicenseCredential"]
        }


        json_str = json.dumps(data)

        qr = qrcode.QRCode(version=1, box_size=10, border=4)
        qr.add_data(json_str)
        qr.make(fit=True)

        img = qr.make_image(fill_color="black", back_color="white")

        buf = io.BytesIO()
        img.save(buf, format="PNG")
        buf.seek(0)

        # Encode image as base64
        img_base64 = base64.b64encode(buf.read()).decode("utf-8")
        data_uri = f"data:image/png;base64,{img_base64}"

        return JSONResponse({
            "qrCodeDataUri": data_uri,
            "data": data
        })

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))