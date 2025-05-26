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

class Vehicle_VC(BaseModel):
    make: str
    model: str
    year: int
    vin: str = Field(..., min_length=17, max_length=17)

class DrivingLicense_VC(BaseModel):
    license_number: str
    issue_date: date
    expiry_date: date
    issuing_state: str
    license_class: str

class Pre_InsuranceData(BaseModel):
    vehicle_vc: Vehicle_VC
    driving_license_vc: DrivingLicense_VC