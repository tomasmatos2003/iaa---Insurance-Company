pragma circom 2.0.0;

include "node_modules/circomlib/circuits/comparators.circom";
include "node_modules/circomlib/circuits/poseidon.circom";

template TimestampCheckWithHash() {
    signal input timestamp;       // e.g., 1719999999
    signal input currentTime;     // e.g., 1720000000
    signal input plateNumber;     // the car license plate as a field element
    signal output isValid;        // 1 if timestamp < currentTime
    signal output plateHash;      // hashed plate (Poseidon)

    // Timestamp comparison
    component lt = LessThan(64);
    lt.in[0] <== timestamp;
    lt.in[1] <== currentTime;
    isValid <== lt.out;

    // Hash the plate
    component hasher = Poseidon(1);
    hasher.inputs[0] <== plateNumber;
    plateHash <== hasher.out;
}

component main = TimestampCheckWithHash();
