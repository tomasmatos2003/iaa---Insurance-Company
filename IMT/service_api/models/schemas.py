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
    familyName: str
    givenName: str
    birthDate: date = Field(..., example="1990-05-15")
    birthPlace: str
    nationality: str
    streetAddress: Optional[str] = Field(None, example="123 Main St, Springfield")
    postalCode: Optional[str] = Field(None, example="6270-133")
    city: str
    country: str
    issuingAuthority: str
    categoryCode: Optional[str] = Field(None, example="B")
    categoryFirstIssueDate: date = Field(..., example="2030-01-01")
    categoryValidUntil: date = Field(..., example="2030-01-01")
    categoryRestrictions: Optional[str] = Field(None, example="01, 02")

class DLWrapper(BaseModel):
    driving_license: DrivingLicenseData