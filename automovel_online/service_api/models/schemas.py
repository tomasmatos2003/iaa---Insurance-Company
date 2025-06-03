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



class Address(BaseModel):
    streetAddress: str
    postalCode: str
    city: str
    country: str


class Owner(BaseModel):
    name: str
    address: Address


class Seating(BaseModel):
    seats: str
    standingPlaces: str


class VehicleCategory(BaseModel):
    nationalCategory: str
    vehicleType: str
    transmissionType: str


class Tyres(BaseModel):
    frontTyres: str
    rearTyres: str


class VehicleData(BaseModel):
    countryDistinguishingSign: str = Field(..., example="PT")
    issuingAuthorities: str = Field(..., example="Instituto da Mobilidade e dos Transportes")
    plateNumber: str
    firstRegistrationDate: str = Field(..., example="2022-01-15")
    owner: Owner
    brand: str
    model: str
    commercialName: str
    vin: str
    unladenWeight: str
    fuelType: str
    seating: Seating
    vehicleCategory: VehicleCategory
    color: str
    tyres: Tyres
    specialNotes: str


class VehicleWrapper(BaseModel):
    vehicle: VehicleData