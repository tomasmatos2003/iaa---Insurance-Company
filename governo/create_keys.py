import os
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.backends import default_backend
from dotenv import load_dotenv
import base58


load_dotenv()
KEYS_DIR = "keys"
PRIVATE_KEY_FILE = os.path.join(KEYS_DIR, "private_key.pem")
PUBLIC_KEY_FILE = os.path.join(KEYS_DIR, "public_key.pem")


def get_did_key_from_pubkey(public_key) -> str:

    pub_bytes = public_key.public_bytes(
        encoding=serialization.Encoding.X962,
        format=serialization.PublicFormat.UncompressedPoint
    )
    multicodec_prefix = b'\x12\x00'  

    prefixed_key = multicodec_prefix + pub_bytes
    mb_key = 'z' + base58.b58encode(prefixed_key).decode('utf-8')
    did_key = f'did:key:{mb_key}'
    return did_key


def generate_and_store_keys(passphrase: bytes):
    os.makedirs(KEYS_DIR, exist_ok=True)

    private_key = ec.generate_private_key(ec.SECP256R1(), default_backend())

    encrypted_private_key = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.BestAvailableEncryption(passphrase)
    )

    public_key = private_key.public_key()
    public_pem = public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    )

    with open(PRIVATE_KEY_FILE, "wb") as f:
        f.write(encrypted_private_key)

    with open(PUBLIC_KEY_FILE, "wb") as f:
        f.write(public_pem)

    print(f"Keys generated and saved to {KEYS_DIR}/")
    print(f"Encrypted private key file: {PRIVATE_KEY_FILE}")
    print(f"Public key file: {PUBLIC_KEY_FILE}")

def load_private_key(passphrase: bytes):
    with open(PRIVATE_KEY_FILE, "rb") as f:
        private_key = serialization.load_pem_private_key(
            f.read(),
            password=passphrase,
            backend=default_backend()
        )
    return private_key

def update_env_with_did(did: str, env_path=".env"):
    lines = []
    if os.path.exists(env_path):
        with open(env_path, "r") as f:
            lines = f.readlines()

    key_exists = False
    with open(env_path, "w") as f:
        for line in lines:
            if line.startswith("DID_KEY="):
                f.write(f"\nDID_KEY={did}\n")
                key_exists = True
            else:
                f.write(line)
        if not key_exists:
            f.write(f"DID_KEY={did}\n")


def main():
    passphrase = os.getenv("PASSPHRASE")
    if not passphrase:
        print(f"Error: Set the environment variable PASSPHRASE with your passphrase.")
        return

    passphrase_bytes = passphrase.encode()

    if os.path.exists(PRIVATE_KEY_FILE) and os.path.exists(PUBLIC_KEY_FILE):
        print("Keys found, loading private key...")
        private_key = load_private_key(passphrase_bytes)
        print("Private key loaded successfully.")
    else:
        print("Keys not found, generating new key pair...")
        generate_and_store_keys(passphrase_bytes)
        private_key = load_private_key(passphrase_bytes)  

    public_key = private_key.public_key()
    did_key = get_did_key_from_pubkey(public_key)
    print(f"Derived DID: {did_key}")

    update_env_with_did(did_key)
    print("DID_KEY updated in .env file.")


if __name__ == "__main__":
    main()
