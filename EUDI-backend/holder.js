import express from 'express';
import fs from 'fs';
import bodyParser from 'body-parser';

import * as DidKey from '@digitalbazaar/did-method-key';
import * as DidWeb from '@digitalbazaar/did-method-web';
import * as EcdsaMultikey from '@digitalbazaar/ecdsa-multikey';
import {
  cryptosuite as ecdsaRdfc2019Cryptosuite
} from '@digitalbazaar/ecdsa-rdfc-2019-cryptosuite';

import * as vc from '@digitalbazaar/vc';
import {CachedResolver} from '@digitalbazaar/did-io';
import {DataIntegrityProof} from '@digitalbazaar/data-integrity';
import {securityLoader} from '@digitalbazaar/security-document-loader';
import {contexts as diContexts} from '@digitalbazaar/data-integrity-context';

const app = express();
app.use(bodyParser.json({limit: '5mb'})); // Allow JSON body up to 5MB

// Document loader with security contexts
const loader = securityLoader();
loader.addDocuments({documents: diContexts});

loader.addStatic(
  "https://www.w3.org/ns/odrl.jsonld",
  await fetch("https://www.w3.org/ns/odrl.jsonld").then(res => res.json())
);
loader.addStatic(
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

// POST /vp - Receives a VC, returns a signed VP
app.post('/vp', async (req, res) => {
  try {
    const verifiableCredential = req.body.verifiableCredential;
    console.log("Received VC:", JSON.stringify(verifiableCredential, null, 2));
    if (!verifiableCredential) {
      return res.status(400).json({error: "Missing 'verifiableCredential' in request body"});
    }

    // Setup example DID
    const VP_DID = 'did:web:example.org:issuer:123';
    const VP_DID_URL = 'https://example.org/issuer/123';

    // Generate key pair for holder
    const vpEcdsaKeyPair = await EcdsaMultikey.generate({curve: 'P-384'});
    fs.writeFileSync('vpEcdsaKeyPair.json', JSON.stringify(await vpEcdsaKeyPair.export({publicKey: true})));


    const {
      didDocument: vpDidDocument,
      methodFor: vpMethodFor
    } = await didWebDriver.fromKeyPair({
      url: VP_DID_URL,
      verificationKeyPair: vpEcdsaKeyPair
    });

    const didWebKey = vpMethodFor({purpose: 'authentication'});
    vpEcdsaKeyPair.id = didWebKey.id;
    vpEcdsaKeyPair.controller = vpDidDocument.id;

    const vpSigningSuite = new DataIntegrityProof({
      signer: vpEcdsaKeyPair.signer(),
      cryptosuite: ecdsaRdfc2019Cryptosuite
    });

    loader.addStatic(VP_DID, vpDidDocument);
    const vpDidVm = structuredClone(vpDidDocument.verificationMethod[0]);
    vpDidVm['@context'] = 'https://w3id.org/security/multikey/v1';
    loader.addStatic(vpDidVm.id, vpDidVm);

    // Holder DID and challenge
    const holder = 'did:web:ua.pt:holder:student:456';
    const challenge = 'abc123';
    const domain = 'https://example.com/';

    // Create presentation
    const presentation = await vc.createPresentation({
      verifiableCredential: vc.verifiableCredential,
      holder: holder
    });

    // Sign presentation
    const vp = await vc.signPresentation({
      presentation,
      suite: vpSigningSuite,
      challenge,
      domain,
      documentLoader
    });

    console.log("Generated VP:", JSON.stringify(vp, null, 2));

    return res.json(vp);
  } catch (err) {
    console.error("Error generating VP:", err);
    return res.status(500).json({error: err.message || 'Internal Server Error'});
  }
});

// Start server
const PORT = 3035;
app.listen(PORT, () => {
  console.log(`VP Server running on http://localhost:${PORT}`);
});