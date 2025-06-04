import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';

const vp = {
  "@context": [
    "https://www.w3.org/2018/credentials/v1"
  ],
  "type": [
    "VerifiablePresentation"
  ],
  "verifiableCredential": [
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
  ],
  "holder": "did:web:ua.pt:holder:student:456",
  "proof": {
    "type": "EcdsaSecp256r1Signature2020",
    "created": "2025-06-02T23:22:34.877Z",
    "proofPurpose": "authentication",
    "verificationMethod": "did:web:ua.pt:holder:student:456#keys-1",
    "challenge": "abc123",
    "domain": "https://example.com/",
    "jws": "MEUCIH8z4LzBE60C4IFlCiD6E4Twtqblpr45Pg7jbf9q24OuAiEArHehGD970yTHb6SQrC6TaZeysaBsdnzbl0WPRgdyML0="
  }
};

const expectedChallenge = 'abc123';
const expectedDomain = 'https://example.com/';

const VerifyVPScreen = () => {
  const [result, setResult] = useState<string | null>(null);

  const verifyVP = async () => {
    try {
      const response = await fetch('http://192.168.122.1:3000/verify-vp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vp,
          expectedChallenge,
          expectedDomain,
        }),
      });

      const resultJson = await response.json();

      if (response.ok) {
        setResult(resultJson.isValid ? '✅ VP is VALID!' : '❌ VP is INVALID.');
      } else {
        setResult(`❌ Error: ${resultJson.message || 'Invalid response'}`);
      }
    } catch (err: any) {
      console.error(err);
      setResult(`⚠️ Error verifying: ${err.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verifiable Presentation Checker</Text>
      <Button title="Verify VP" onPress={verifyVP} />
      {result && <Text style={styles.result}>{result}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  result: { marginTop: 30, fontSize: 18, textAlign: 'center' },
});

export default VerifyVPScreen;
