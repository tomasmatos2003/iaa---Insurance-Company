from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
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
    # role: Optional[str] = None


class DrivingLicenseData(BaseModel):
    license_number: str = Field(..., example="DL1234567890")
    issue_date: date = Field(..., example="2020-01-01")
    expiry_date: date = Field(..., example="2030-01-01")
    name: str = Field(..., example="John Doe")
    dob: date = Field(..., example="1990-05-15")
    address: Optional[str] = Field(None, example="123 Main St, Springfield")
    category: Optional[str] = Field(None, example="B")

class DLWrapper(BaseModel):
    driving_license: DrivingLicenseData