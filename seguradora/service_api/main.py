from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from pymongo import MongoClient
from common.hashing import Hash
from common.oauth import get_current_user
from common.jwttoken import create_access_token
from fastapi import Depends, HTTPException, status
from models.schemas import User, Login, Token, TokenData, Pre_InsuranceData    
from datetime import datetime
import requests
import qrcode
import io
import base64
from fastapi.responses import JSONResponse
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



@app.post("/insert_data")
def insert_insurance_data(
    request: Pre_InsuranceData,
    current_user: TokenData = Depends(get_current_user)
):
    dl = request.driving_license_vc.dict()

    # Convert both issue_date and expiry_date to ISO strings
    dl["issue_date"] = datetime.combine(dl["issue_date"], datetime.min.time()).isoformat()
    dl["expiry_date"] = datetime.combine(dl["expiry_date"], datetime.min.time()).isoformat()

    insurance_data = {
        "user": current_user.username,
        "driving_license": dl,
        "vehicle": request.vehicle_vc.dict()
    }
    # Call external signing API
    try:
        signing_response = requests.post(
            "http://127.0.0.1:8001/sign-json",
            json={"data": insurance_data},
            timeout=5
        )
        signing_response.raise_for_status()
        signature = signing_response.json().get("signature")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Signing service error: {str(e)}")

    insurance_entry = insurance_data.copy()
    insurance_entry["signature"] = signature

    # Convert date strings back to datetime for MongoDB if needed
    insurance_entry["driving_license"]["issue_date"] = datetime.fromisoformat(insurance_entry["driving_license"]["issue_date"])
    insurance_entry["driving_license"]["expiry_date"] = datetime.fromisoformat(insurance_entry["driving_license"]["expiry_date"])

    db["insurance_applications"].insert_one(insurance_entry)

    return {
        "message": "Insurance application submitted successfully.",
        "submitted_by": current_user.username,
        "signature": signature
    }

@app.get("/generate_qrcode")
def generate_qrcode(current_user: TokenData = Depends(get_current_user)):
    try:
        data = {
            "url": "http://127.0.0.1:8000/send_vc",
            "requiredVCs": ["vehicle_vc", "driving_license_vc"]
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