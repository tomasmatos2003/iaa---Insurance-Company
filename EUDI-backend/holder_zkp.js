const snarkjs = require("snarkjs");
const fs = require("fs");
const circomlibjs = require("circomlibjs");

async function main() {
  // Simulate a car plate number (e.g., "ABC1234") and hash it using Poseidon
  const plateString = "ABC1234";

  // Hash the plate using Poseidon (circomlibjs expects BigInts)
  const poseidon = await circomlibjs.buildPoseidon();
  const plateBigInt = BigInt("0x" + Buffer.from(plateString).toString("hex"));
  const plateHash = poseidon.F.toString(poseidon([plateBigInt]));

  // Inputs for the circuit
  const input = {
    timestamp: 1719999999,
    currentTime: 1720000000,
    plateNumber: plateBigInt.toString()
  };

  console.log("🚘 Plate:", plateString);
  console.log("🔢 Plate as BigInt:", plateBigInt.toString());
  console.log("🔐 Poseidon Hash:", plateHash);

  // Generate the proof and public signals
  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    input,
    "vp_js/vp.wasm",           // Make sure this matches your compiled WASM
    "circuit_0000.zkey"       // Use your final trusted zkey
  );

  console.log("✅ Public signals [isValid, plateHash]:", publicSignals);
  console.log("✅ Proof:", proof);
}

main().catch((err) => {
  console.error("❌ Error running proof:", err);
});

