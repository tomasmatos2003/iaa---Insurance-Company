from pydantic import BaseModel
from typing import Optional

class User(BaseModel):
    username: str
    company: str
    password: str
    # role: str

class Login(BaseModel):
    username: str
    password: str 

class Token(BaseModel):
    access_token: str
    token_type: str 

class TokenData(BaseModel):
    username: Optional[str] = None
    # role: Optional[str] = None

# class eBL(BaseModel):
#     name: str
#     description: str