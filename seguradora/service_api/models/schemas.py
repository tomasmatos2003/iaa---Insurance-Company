from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Dict, Any
from datetime import date

class User(BaseModel):
    username: str
    # company: str
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

class Pre_InsuranceData(BaseModel):
    vehicle_vc: Dict[str, Any]
    driving_license_vc: Dict[str, Any]