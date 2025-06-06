import express from 'express';
import fs from "fs/promises";
import * as DidKey from '@digitalbazaar/did-method-key';
import * as DidWeb from '@digitalbazaar/did-method-web';
import * as EcdsaMultikey from '@digitalbazaar/ecdsa-multikey';
import { cryptosuite as ecdsaRdfc2019Cryptosuite } from '@digitalbazaar/ecdsa-rdfc-2019-cryptosuite';
import * as vc from '@digitalbazaar/vc';
import { CachedResolver } from '@digitalbazaar/did-io';
import { DataIntegrityProof } from '@digitalbazaar/data-integrity';
import { securityLoader } from '@digitalbazaar/security-document-loader';
import { contexts as diContexts } from '@digitalbazaar/data-integrity-context';
import * as snarkjs from 'snarkjs';
import * as circomlibjs from 'circomlibjs';

const app = express();
app.use(express.json()); // parse JSON bodies

// Setup documentLoader with security contexts
const loader = securityLoader();
loader.addDocuments({ documents: diContexts });

await loader.addStatic(
  "https://www.w3.org/ns/odrl.jsonld",
  await fetch("https://www.w3.org/ns/odrl.jsonld").then(res => res.json())
);
await loader.addStatic(
  "https://www.w3.org/2018/credentials/examples/v1",
  await fetch("https://www.w3.org/2018/credentials/examples/v1").then(res => res.json())
);

const resolver = new CachedResolver();
const didKeyDriverMultikey = DidKey.driver();
const didWebDriver = DidWeb.driver();

didKeyDriverMultikey.use({
  multibaseMultikeyHeader: 'zDna',
  fromMultibase: EcdsaMultikey.from
});
didWebDriver.use({
  multibaseMultikeyHeader: 'zDna',
  fromMultibase: EcdsaMultikey.from
});
didWebDriver.use({
  multibaseMultikeyHeader: 'z82L',
  fromMultibase: EcdsaMultikey.from
});

resolver.use(didKeyDriverMultikey);
resolver.use(didWebDriver);
loader.setDidResolver(resolver);
const documentLoader = loader.build();

async function main({ verifiablePresentation, documentLoader, challenge }) {
  const VP_DID = 'did:web:example.org:issuer:123';
  const VP_DID_URL = 'https://example.org/issuer/123';

  console.log('VPPPPP: ', verifiablePresentation);
  const { vp, publicKey } = verifiablePresentation;

  verifiablePresentation = vp;

  console.log('🔑 Loading ECDSA KeyPair from file...');
  const vpEcdsaKeyPairData = publicKey
  console.log('🔑 Raw KeyPair Data:', vpEcdsaKeyPairData);


  const vpEcdsaKeyPair = await EcdsaMultikey.from(vpEcdsaKeyPairData);
  console.log('🔑 Parsed ECDSA KeyPair:', vpEcdsaKeyPair);

  const { didDocument: vpDidDocument, methodFor: vpMethodFor } = await didWebDriver.fromKeyPair({
    url: VP_DID_URL,
    verificationKeyPair: vpEcdsaKeyPair
  });

  console.log('📝 DID Document:', vpDidDocument);
  console.log('🔍 MethodFor function:', vpMethodFor);

  const didWebKey = vpMethodFor({ purpose: 'authentication' });
  console.log('🔑 DID Web Key for authentication:', didWebKey);

  vpEcdsaKeyPair.id = didWebKey.id;
  vpEcdsaKeyPair.controller = vpDidDocument.id;
  console.log('🔑 Updated KeyPair with id and controller:', vpEcdsaKeyPair);

  const vpVerifyingSuite = new DataIntegrityProof({
    cryptosuite: ecdsaRdfc2019Cryptosuite
  });

  loader.addStatic(VP_DID, vpDidDocument);
  console.log(`📚 Added static DID Document to loader for ${VP_DID}`);

  const vpDidVm = structuredClone(vpDidDocument.verificationMethod[0]);
  vpDidVm['@context'] = 'https://w3id.org/security/multikey/v1';
  loader.addStatic(vpDidVm.id, vpDidVm);
  console.log(`📚 Added static verification method to loader for ${vpDidVm.id}`);

  // Log the VP to be verified and challenge
  console.log('🧾 Verifiable Presentation to verify:', JSON.stringify(verifiablePresentation, null, 2));
  console.log('🔐 Challenge used for verification:', challenge);

  try {
    const verifyPresentationResult = await vc.verify({
      presentation: verifiablePresentation,
      challenge,
      suite: vpVerifyingSuite,
      documentLoader
    });

    console.log('✅ Verification Result:', verifyPresentationResult);
    return verifyPresentationResult;
  } catch (e) {
    console.error('❌ Error during verification:', e);
    throw e;
  }
}

app.post('/verify-vp', async (req, res) => {
  try {
    const { verifiablePresentation, challenge } = req.body;

    console.log('📥 Received Verifiable Presentation:', JSON.stringify(verifiablePresentation, null, 2));
    console.log('📥 Received Challenge:', challenge);

    if (!verifiablePresentation || !challenge) {
      return res.status(400).json({ error: 'verifiablePresentation and challenge are required in the request body' });
    }

    const result = await main({ verifiablePresentation, documentLoader, challenge });

    if (result.verified) {
      console.log('🎉 VP successfully verified!');
      return res.json({ verified: true, result });
    } else {
      console.warn('⚠️ VP verification failed:', result.error || result.errors);
      return res.status(400).json({ verified: false, errors: result.error || result.errors });
    }
  } catch (error) {
    console.error('Error verifying VP:', error);
    return res.status(500).json({ error: error.message });
  }
});


app.post('/verify-zkp', async (req, res) => {
  try {
    const { publicSignals, proof , plateNumber} = req.body;
    
    if (!publicSignals || !proof) {
      return res.status(400).json({ error: "Missing publicSignals or proof in body" });
    }

    console.log("📥 Received public signals:", publicSignals)
    console.log("📥 Received proof:", proof);

    // Carregar a verification key
    const vKey = JSON.parse(await fs.readFile("verification_key.json", "utf-8"));

    // Verificar a prova
    const isValid = await snarkjs.groth16.verify(vKey, publicSignals, proof);
    const poseidon = await circomlibjs.buildPoseidon();
    const plateBigInt = BigInt("0x" + Buffer.from(plateNumber).toString("hex"));
    const plateHash = poseidon.F.toString(poseidon([plateBigInt]));

    if (isValid) {
      console.log("✅ Verification OK");
      if (publicSignals[1] !== plateHash) {
        console.warn("⚠️ Plate hash does not match the expected value.");
        return res.status(400).json({ valid: false, error: "Plate hash mismatch" });
      }
      if (publicSignals[0] !== "1") {
        console.warn("⚠️ Public signal isValid is not true.");
        return res.status(400).json({ valid: false, error: "Public signal isValid is not true" });
      } 
      return res.json({ verified: true, publicSignals });
    } else {
      console.log("❌ Invalid proof");
      return res.status(400).json({ valid: false, error: "Invalid proof" });
    }

  } catch (err) {
    console.error("❌ Error verifying ZKP:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


const PORT = 3030;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});