import * as snarkjs from "snarkjs";
import fs from "fs";

async function main() {
  // Load the verification key
  const vKey = JSON.parse(fs.readFileSync("verification_key.json"));

  // Use hardcoded public signals
  const publicSignals = [
    '1',
    '7320623380035923930391507142926323064651981253334657455405155987608578843102'
  ];

  // Use hardcoded proof
  const proof = {
    pi_a: [
      '7768029169484376349872244942359743260717110350068595669914799792495543660079',
      '16399223620873954009498465819352003080115863733789181887908605818243217247540',
      '1'
    ],
    pi_b: [
      [
        '11753606628213445421699940993818887761230520441007463850151986729882820457226',
        '6510502973320702205455333517868141582790119173194142203270853684563064232710'
      ],
      [
        '216517711634309177530858913633022614054490447649270677213294457256854146248',
        '14551609685096542412870082002955366161346576566327012988506337920847019836071'
      ],
      ['1', '0']
    ],
    pi_c: [
      '13272507173723808387167736752579320374485698874897176811715593703368790954836',
      '21182210805854757845953628823366114930201317173176666081317900049818308771193',
      '1'
    ],
    protocol: 'groth16',
    curve: 'bn128'
  };

  // Verify the proof
  const isValid = await snarkjs.groth16.verify(vKey, publicSignals, proof);

  if (isValid) {
    console.log("✅ Verification OK");
    console.log("📤 Public signals (isValid, plateHash):", publicSignals);
  } else {
    console.log("❌ Invalid proof");
  }
}

main().catch((err) => {
  console.error("❌ Error:", err);
});

