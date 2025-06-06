import express from 'express';
import fs from 'fs';

import * as DidKey from '@digitalbazaar/did-method-key';
import * as DidWeb from '@digitalbazaar/did-method-web';
import * as EcdsaMultikey from '@digitalbazaar/ecdsa-multikey';
import { cryptosuite as ecdsaRdfc2019Cryptosuite } from '@digitalbazaar/ecdsa-rdfc-2019-cryptosuite';
import * as vc from '@digitalbazaar/vc';
import { CachedResolver } from '@digitalbazaar/did-io';
import { DataIntegrityProof } from '@digitalbazaar/data-integrity';
import { securityLoader } from '@digitalbazaar/security-document-loader';
import { contexts as diContexts } from '@digitalbazaar/data-integrity-context';

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

const PORT = 3030;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});