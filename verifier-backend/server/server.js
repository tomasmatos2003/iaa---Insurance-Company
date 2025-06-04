const fs = require('fs');
const crypto = require('crypto');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

const didPublicKeys = require('./didPublicKeys.json');

app.use(bodyParser.json({ limit: '1mb' }));

app.post('/verify-vp', (req, res) => {
  try {
    const { vp, expectedChallenge, expectedDomain } = req.body;

    if (!vp || !expectedChallenge || !expectedDomain) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { proof, ...unsignedPresentation } = vp;

    // 🔍 Extract DID from the holder or verificationMethod
    const did = vp.holder || (proof.verificationMethod?.split('#')[0]);

    if (!did || !didPublicKeys[did]) {
      return res.status(404).json({ error: `Public key for DID '${did}' not found` });
    }

    const publicKeyPem = didPublicKeys[did];

    const dataToVerify = JSON.stringify({
      ...unsignedPresentation,
      challenge: proof.challenge,
      domain: proof.domain,
    });

    const verify = crypto.createVerify('SHA256');
    verify.update(dataToVerify);
    verify.end();

    const signatureValid = verify.verify(publicKeyPem, Buffer.from(proof.jws, 'base64'));
    const challengeMatch = proof.challenge === expectedChallenge;
    const domainMatch = proof.domain === expectedDomain;

    const result = {
      did,
      challengeMatch,
      domainMatch,
      signatureValid,
      isValid: signatureValid && challengeMatch && domainMatch
    };

    return res.json(result);
  } catch (err) {
    console.error('❌ Verification error:', err);
    return res.status(500).json({ error: 'Verification failed', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🔐 VP Verification Server running at http://localhost:${PORT}`);
});
