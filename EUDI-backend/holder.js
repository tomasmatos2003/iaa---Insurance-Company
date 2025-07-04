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
import * as snarkjs from 'snarkjs';
import * as circomlibjs from 'circomlibjs';

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
    const exportedKey = await vpEcdsaKeyPair.export({publicKey: true});
    fs.writeFileSync('vpEcdsaKeyPair.json', JSON.stringify(exportedKey, null, 2));


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

    // Respond with VP and public key JSON

    console.log("Exported public key:", JSON.stringify(exportedKey, null, 2));
    return res.json({
      vp,
      publicKey: exportedKey
    });
  } catch (err) {
    console.error("Error generating VP:", err);
    return res.status(500).json({error: err.message || 'Internal Server Error'});
  }
});

app.post("/zkp", async (req, res) => {
  const vc = req.body.verifiableCredential;
  console.log("Received ZKP request with VC:", JSON.stringify(vc, null, 2));
  console.log("Received VC for ZKP 1111:", vc.credentialSubject);
  
  try {
    let plateString = "123";

    if (vc.type[1] === "DrivingLicenseCredential") {
      console.log("Processing Driving License Credential - " , vc.id);
      plateString = vc.id;
    }
    else if (vc.type[1] === "InsuranceCredential") { 
      console.log("Processing Insurance Credential - " , vc.credentialSubject.insurancePolicy.policyNumber); 
      plateString = vc.credentialSubject.insurancePolicy.policyNumber;
    }
    else if (vc.type[1] === "AutomobileCredential") {
      console.log("Processing Vehicle Credential - " , vc.credentialSubject.vehicle.plateNumber);
      plateString = vc.credentialSubject.vehicle.plateNumber;
    }

    console.log("Received VC for ZKP:", JSON.stringify(vc, null, 2));

    // 🔐 Hash com Poseidon
    const poseidon = await circomlibjs.buildPoseidon();
    const plateBigInt = BigInt("0x" + Buffer.from(plateString).toString("hex"));
    const plateHash = poseidon.F.toString(poseidon([plateBigInt]));

    //expirationDate: '2026-06-05T22:04:44.363958Z' to timestamp in integer
    const expirationDate =vc.expirationDate
    const expirationTimestamp = expirationDate ? Math.floor(new Date(expirationDate).getTime() / 1000) : null;
    const atual_timestamp = Math.floor(Date.now() / 1000); // Current timestamp in seconds

    console.log("Atual_timestamp:", atual_timestamp);
    console.log("Expiration Timestamp:", expirationTimestamp);
    // Inputs para o circuito ZKP
    const input = {
      timestamp: atual_timestamp || 1719999999,
      currentTime: expirationTimestamp || 1720000000,
      plateNumber: plateBigInt.toString()
    };

    // Geração da prova
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      input,
      "vp_js/vp.wasm",
      "circuit_0000.zkey"
    );

    console.log("✅ Public signals:", publicSignals);

    res.json({
      proof,
      publicSignals,
      plateHash
    });
  } catch (err) {
    console.error("❌ ZKP error:", err);
    res.status(500).json({ error: "ZKP generation failed", details: err.message });
  }
});
// Start server
const PORT = 3035;
app.listen(PORT, () => {
  console.log(`VP Server running on http://localhost:${PORT}`);
});