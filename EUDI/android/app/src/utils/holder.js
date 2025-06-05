// ✅ Sends a VC to the backend to receive a signed Verifiable Presentation (VP)
export async function signPresentation(vc) {
  console.log('▶️ Sending VC to sign as a presentation:\n', JSON.stringify(vc, null, 2));

  try {
    const response = await fetch('http://192.168.1.149:3035/vp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ verifiableCredential: vc })  // Ensure wrapped under correct key
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const vp = await response.json();
    // Se `vp` for um objeto complexo ou uma instância, transforma-o para JSON plano:
    const vpPlain = JSON.parse(JSON.stringify(vp));

    console.log('✅ Received plain VP from server:\n', JSON.stringify(vpPlain, null, 2));

    return vpPlain;
  } catch (error) {
    console.error('❌ Failed to sign presentation:', error);
    return { error: error.message };
  }
}