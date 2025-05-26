# utils.py (run once offline)
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.backends import default_backend
from dotenv import load_dotenv
import os
load_dotenv()

def generate_key():
    # Generate private key
    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048,
        backend=default_backend()
    )
    passphrase = os.getenv("PASSPHRASE")
    if not passphrase:
        raise ValueError("PASSPHRASE environment variable is not set or empty")

    encrypted_pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.BestAvailableEncryption(passphrase.encode())
    )
    with open("keys/private_key.pem", "wb") as f:
        f.write(encrypted_pem)

    # Save public key in plain text
    public_key = private_key.public_key()
    public_pem = public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    )
    with open("keys/public_key.pem", "wb") as f:
        f.write(public_pem)

if __name__ == "__main__":
    generate_key()
