import requests
import base64
from io import BytesIO
from PIL import Image


BASE_URL = "http://127.0.0.1:8000"

USERNAME = "your_username"
PASSWORD = "your_password"

payload = {
    "AutomobileCredential": 
       {
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://www.w3.org/2018/credentials/examples/v1"
  ],
  "id": "urn:uuid:5a0642e4-43ea-4529-aa5a-323aafe36012",
  "type": [
    "VerifiableCredential",
    "AutomobileCredential"
  ],
  "credentialSubject": {
    "id": "did:automobile:a",
    "vehicle": {
      "countryDistinguishingSign": "PT",
      "issuingAuthorities": "Instituto da Mobilidade e dos Transportes",
      "plateNumber": "asd",
      "firstRegistrationDate": "2022-01-15",
      "owner": {
        "name": "ads",
        "address": {
          "streetAddress": "asd",
          "postalCode": "asd",
          "city": "Lisbon",
          "country": "Spain"
        }
      },
      "brand": "Ford",
      "model": "asd",
      "commercialName": "asd",
      "vin": "asd",
      "unladenWeight": "asd",
      "fuelType": "Petrol",
      "seating": {
        "seats": "1",
        "standingPlaces": "2"
      },
      "vehicleCategory": {
        "nationalCategory": "N1",
        "vehicleType": "Truck",
        "transmissionType": "Automatic"
      },
      "color": "Brown",
      "tyres": {
        "frontTyres": "255/35 R19",
        "rearTyres": "275/40 R20"
      },
      "specialNotes": "asd"
    }
  },
  "issuer": "did:key:zXwpV6kY2FqjziZDTbV2anRUMrnKdVNGwPgyYqiLc6N8p16JWStmHEK35yEAn3jvTTYHiw8hzkJxLDKiDApsbRehANyk",
  "issuanceDate": "2025-06-03T15:32:39.845258Z",
  "expirationDate": "2026-06-03T15:32:39.845258Z",
  "proof": {
    "type": "DataIntegrityProof",
    "created": "2025-06-03T15:32:39Z",
    "verificationMethod": "did:key:zXwpV6kY2FqjziZDTbV2anRUMrnKdVNGwPgyYqiLc6N8p16JWStmHEK35yEAn3jvTTYHiw8hzkJxLDKiDApsbRehANyk#did:key:zXwpV6kY2FqjziZDTbV2anRUMrnKdVNGwPgyYqiLc6N8p16JWStmHEK35yEAn3jvTTYHiw8hzkJxLDKiDApsbRehANyk",
    "cryptosuite": "ecdsa-rdfc-2019",
    "proofPurpose": "assertionMethod",
    "proofValue": "MEYCIQCzcy18k0ay927QHKgcqp1Rb_DzOX6W-2uyAjIvXepzbwIhAISgOAsqHbEEoXPB20NH1q1rjFEtcRWEntfdCTH2VtUG"
  }
}

    ,
    "DrivingLicenseCredential": 
     {
    "@context": [
      "https://www.w3.org/2018/credentials/v1",
      "https://www.w3.org/2018/credentials/examples/v1"
    ],
    "id": "urn:uuid:1a098e59-baac-4af6-8dff-6d0c6a0978b2",
    "type": [
      "VerifiableCredential",
      "DrivingLicenseCredential"
    ],
    "credentialSubject": {
      "id": "did:card:a",
      "familyName": "Matos",
      "givenName": "Tomás",
      "birthDate": "2025-06-13",
      "birthPlace": "Averi",
      "nationality": "TRE",
      "streetAddress": "20 Rua da Alagoa, Paranhos da Beira",
      "postalCode": "6270-133",
      "city": "Seia",
      "country": "Portugal",
      "issuingAuthority": "Instituto da Mobilidade e dos Transportes",
      "categoryCode": "A",
      "categoryFirstIssueDate": "2025-06-17",
      "categoryValidUntil": "2025-07-10",
      "categoryRestrictions": "01, 02"
    },
    "issuer": "did:key:zXwpV6kY2FqjziZDTbV2anRUMrnKdVNGwPgyYqiLc6N8p16JWStmHEK35yEAn3jvTTYHiw8hzkJxLDKiDApsbRehANyk",
    "issuanceDate": "2025-06-02T17:52:02.534218Z",
    "expirationDate": "2026-06-02T17:52:02.534218Z",
    "proof": {
      "type": "DataIntegrityProof",
      "created": "2025-06-02T17:52:02Z",
      "verificationMethod": "did:key:zXwpV6kY2FqjziZDTbV2anRUMrnKdVNGwPgyYqiLc6N8p16JWStmHEK35yEAn3jvTTYHiw8hzkJxLDKiDApsbRehANyk#did:key:zXwpV6kY2FqjziZDTbV2anRUMrnKdVNGwPgyYqiLc6N8p16JWStmHEK35yEAn3jvTTYHiw8hzkJxLDKiDApsbRehANyk",
      "cryptosuite": "ecdsa-rdfc-2019",
      "proofPurpose": "assertionMethod",
      "proofValue": "MEUCIQD-XkVcP3Ea3HUEqjv7srCPJwBA5PODQoNYes93f8sDfQIgPDIzL9MP-5NhqMhoYVoyDadXkTpKS7GywXhbTOa8M1c"
    }
  }

    }

def register(username, password):
    user_data = {
        "username": username,
        "password": password,
    }
    resp = requests.post(f"{BASE_URL}/register", json=user_data)
    if resp.status_code == 200:
        print("User registered successfully.")
    elif resp.status_code == 400:
        print("Registration failed:", resp.text)
    else:
        resp.raise_for_status()

def login(username, password):
    data = {
        "username": username,
        "password": password,
    }
    headers = {"Content-Type": "application/x-www-form-urlencoded"}
    resp = requests.post(f"{BASE_URL}/login", data=data, headers=headers)
    resp.raise_for_status()
    return resp.json().get("access_token")

def insert_data(token, payload):
  
    resp = requests.post(f"{BASE_URL}/insert_data", json=payload)
    resp.raise_for_status()
    return resp.json()

def get_my_insurance(token):
    headers = {
        "Authorization": f"Bearer {token}"
    }
    resp = requests.get(f"{BASE_URL}/get_my_insurance", headers=headers)
    resp.raise_for_status()
    return resp.json()


def add_base64_padding(base64_string):
    return base64_string + '=' * (-len(base64_string) % 4)

def show_qr_code(qr_base64):
    try:
        # Remove data URL prefix if present
        if qr_base64.startswith("data:image"):
            qr_base64 = qr_base64.split(",")[1]
        qr_base64 = qr_base64.strip()
        qr_base64_padded = add_base64_padding(qr_base64)

        image_data = base64.b64decode(qr_base64_padded)
        image = Image.open(BytesIO(image_data))
        image.show()
    except Exception as e:
        print(f"Error displaying QR code: {e}")
        print("First 100 chars of data:", qr_base64[:100])

def main():
    try:
        register(USERNAME, PASSWORD)

        token = login(USERNAME, PASSWORD)
        if not token:
            print("Failed to retrieve access token.")
            return
        print("Login successful, token obtained.")

        result = insert_data(token, payload)
        print("Insert data response:")
        print(result)

        # insurance = get_my_insurance(token)
        # print("Insurance response:")
        # print(insurance)

        # # Display QR code if available
        # qr_data = insurance.get("qr_code")  # or insurance.get("vc") or insurance.get("qr_code_data")
        # if qr_data:
        #     print("Showing QR code...")
        #     show_qr_code(qr_data)
        # else:
        #     print("No QR code data found in the response.")

    except requests.HTTPError as e:
        print(f"HTTP error occurred: {e.response.status_code} - {e.response.text}")
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    main()