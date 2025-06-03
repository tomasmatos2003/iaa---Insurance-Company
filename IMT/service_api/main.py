from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from pymongo import MongoClient
from common.hashing import Hash
from common.oauth import get_current_user
from common.jwttoken import create_access_token
from fastapi import Depends, HTTPException, status
from models.schemas import User, Login, Token, TokenData, DLWrapper 
from datetime import datetime, timedelta
import requests
from fastapi.encoders import jsonable_encoder
from uuid import uuid4
import qrcode
import io
import base64
import json

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
db = client["User_IMB"]

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

@app.post("/insert_data")
def insert_data(
    request: DLWrapper,
    current_user: TokenData = Depends(get_current_user)
):  
    # Convert driving_license to dict and ensure it's serializable
    dl_dict = request.driving_license.dict()
    dl_dict_serializable = jsonable_encoder(dl_dict)

    vc_id = f"urn:uuid:{uuid4()}"
   
    subject_id = f"did:card:{current_user.username}"

    vc_data = {
        "@context": [
            "https://www.w3.org/2018/credentials/v1",
            "https://www.w3.org/2018/credentials/examples/v1"
        ],
        "id": vc_id,
        "type": [
            "VerifiableCredential",
            "DrivingLicenseCredential"
        ],
        "credentialSubject": {
            "id": subject_id,
            **dl_dict_serializable
        }
    }

    data_to_sign = {
        "user": current_user.username,
        "credential": vc_data
    }

    try:
        signing_response = requests.post(
            "http://127.0.0.1:8002/issue_vc",
            json=data_to_sign,
            timeout=5
        )
        signing_response.raise_for_status()
        signed_vc = signing_response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Signing service error: {str(e)}")


    result = db["driving_licenses"].insert_one(signed_vc)

    # Convert ObjectId to string before JSON serialization
    signed_vc["_id"] = str(result.inserted_id)

    # Now serialize to JSON
    signed_vc_json = json.dumps(signed_vc)

    # Generate QR code from the signed VC JSON
    qr = qrcode.QRCode(version=1, box_size=10, border=4)
    qr.add_data(signed_vc_json)
    qr.make(fit=True)

    img = qr.make_image(fill='black', back_color='white')

    # Convert PIL image to base64 string
    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode('utf-8')

    return {
        "message": "Verifiable Credential submitted successfully.",
        "submitted_by": current_user.username,
        "vc": signed_vc,
        "qr_code": f"data:image/png;base64,{img_str}"
    }

