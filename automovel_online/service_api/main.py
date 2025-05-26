from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from pymongo import MongoClient
from common.hashing import Hash
from common.oauth import get_current_user
from common.jwttoken import create_access_token
from fastapi import Depends, HTTPException, status
from models.schemas import User, Login, Token, TokenData, VehicleWrapper 
from datetime import datetime
import requests

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
db = client["User_automovel"]

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
    request: VehicleWrapper,
    current_user: TokenData = Depends(get_current_user)
):
    data = {
        "user": current_user.username,
        "vehicle": request.vehicle.dict(),
    }

    # Call external signing API
    try:
        signing_response = requests.post(
            "http://127.0.0.1:8002/sign-json",
            json={"data": data},
            timeout=5
        )
        signing_response.raise_for_status()
        signature = signing_response.json().get("signature")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Signing service error: {str(e)}")

    entry = data.copy()
    entry["signature"] = signature

    db["vehicles"].insert_one(entry)

    return {
        "message": "vehicles submitted successfully.",
        "submitted_by": current_user.username,
        "signature": signature
    }