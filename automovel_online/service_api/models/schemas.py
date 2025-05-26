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



class VehicleData(BaseModel):
    make: str = Field(..., example="Toyota")
    model: str = Field(..., example="Corolla")
    year: int = Field(..., ge=1900, le=2100, example=2023)
    vin: str = Field(..., example="1HGCM82633A004352")
    color: Optional[str] = Field(None, example="Blue")
    registrationNumber: Optional[str] = Field(None, example="ABC1234")

class VehicleWrapper(BaseModel):
    vehicle: VehicleData