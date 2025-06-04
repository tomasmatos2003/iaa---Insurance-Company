import { ec as EC } from 'elliptic';
import CryptoJS from 'crypto-js';
import { encode as btoa } from 'base-64'; // ✅ React Native-compatible base64

const ec = new EC('secp256k1');

const HOLDER_DID = 'did:web:ua.pt:holder:student:456';
const PRIVATE_KEY = '1c3a56b785d4aa9b322f5d7fce56ba07a833a43d0d0c59421539b55565bcb1b0';

export function getZkKeyPair() {
  return ec.keyFromPrivate(PRIVATE_KEY);
}

// ✅ Generates a W3C-style proof for Verifiable Presentation
export function signPresentation(presentation, challenge, domain = 'https://example.com/') {
  const keyPair = getZkKeyPair();

  // Hash the presentation + challenge + domain
  const payload = {
    ...presentation,
    challenge,
    domain,
  };

  const dataToSign = JSON.stringify(payload);
  const hash = CryptoJS.SHA256(dataToSign).toString();
  const signature = keyPair.sign(hash);
  const der = signature.toDER();
  const byteString = String.fromCharCode(...der);
  const jws = btoa(byteString); // base64 encoded signature

  const proof = {
    type: 'EcdsaSecp256r1Signature2020',
    created: new Date().toISOString(),
    proofPurpose: 'authentication',
    verificationMethod: `${HOLDER_DID}#keys-1`,
    challenge,
    domain,
    jws,
  };

  return {
    ...presentation,
    proof,
  };
}

export { HOLDER_DID };
