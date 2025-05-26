from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from pymongo import MongoClient
from common.hashing import Hash
from common.oauth import get_current_user
from common.jwttoken import create_access_token
from fastapi import Depends, HTTPException, status
from models.schemas import User, Login, Token, TokenData    

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
db = client["User"]
# ebl_db = client["eBL"]


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



@app.get("/")
def all(current_user: dict = Depends(get_current_user)):
    return {"message": "This is a protected route", "user": current_user["username"]}
