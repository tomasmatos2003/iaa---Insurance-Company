import React from "react";
import { Alert } from "react-native";
import QRCodeScanner from "react-native-qrcode-scanner";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function TestCamera({ navigation }) {
  const getStoredVcs = async () => {
    const allKeys = await AsyncStorage.getAllKeys();
    const vcKeys = allKeys.filter(key => key.startsWith("vc_"));
    const vcItems = await AsyncStorage.multiGet(vcKeys);
    return vcItems.map(([_, value]) => JSON.parse(value));
  };

  const handleRead = async ({ data }) => {
    try {
      const parsed = JSON.parse(data);

      const url = parsed.url;
      const requiredVCs = parsed.requiredVCs;

      if (typeof url !== "string" || !Array.isArray(requiredVCs)) {
        throw new Error("Invalid structure");
      }

      const vcList = requiredVCs.join("\n");

      Alert.alert(
        "Permission Request",
        `Do you agree to share the following VCs?\n\n${vcList}`,
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Allow",
            onPress: async () => {
              try {
                const storedVCs = await getStoredVcs();

                const payload = {}
                for (const reqKey of requiredVCs) {
                  const matchingVC = storedVCs.find(
                    (vc) =>
                      Array.isArray(vc.type) &&
                      vc.type[1] === reqKey
                  );

                  if (matchingVC) {
                    // e.g., "vc_vehicle_vc" -> "vehicle_vc" -> "VehicleCredential"
                    const vcName = reqKey.replace(/^vc_/, "");
                    const formattedKey =
                      vcName
                        .split("_")
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1));

                    payload[formattedKey] = matchingVC;
                  }
                }

                //Print each key-value pair in the payload
                Object.entries(payload).forEach(([key, value]) => {
                  console.log(`${key}:`, JSON.stringify(value, null, 2));
                });

                // Check if all required VCs are available
                console.log("Payload being sent:", payload);
                console.log("Required VCs:", requiredVCs);
                if (Object.keys(payload).length !== requiredVCs.length) {
                  Alert.alert(
                    "Missing Credentials",
                    "Some required credentials are not available on the device."
                  );
                  return;
                }
                const payload1 = {
                    AutomobileCredential: {
                      "@context": ["https://www.w3.org/2018/credentials/v1"],
                      id: "urn:uuid:test-auto",
                      type: ["VerifiableCredential", "AutomobileCredential"],
                      credentialSubject: {
                        vehicle: {
                          plateNumber: "AA-11-11",
                          vin: "VIN123456789",
                        },
                        id: "did:key:test123",
                      },
                    },
                    DrivingLicenseCredential: {
                      "@context": ["https://www.w3.org/2018/credentials/v1"],
                      id: "urn:uuid:test-license",
                      type: ["VerifiableCredential", "DrivingLicenseCredential"],
                      credentialSubject: {
                        givenName: "Jane",
                        familyName: "Doe",
                        id: "did:key:jane_doe",
                      },
                    },
                  };
                console.log("payload", payload1);
                const jsonPayload = JSON.stringify(payload1);
                console.log("JSON payload:", jsonPayload);
                const response = await fetch(url, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                  },
                  body: JSON.stringify(payload),
                });

                console.log("Response status:", response.status);
                const text = await response.text(); // <- await obrigatório!

                if (!response.ok) {
                  console.log("Response text:", text);

                  // Se for JSON válido, tenta extrair a chave "error"
                  let message = `Failed to submit credentials: ${text}`;
                  try {
                    const json = JSON.parse(text);
                    if (json.error) {
                      message = `Failed to submit credentials: ${json.error}`;
                    }
                  } catch (e) {
                    // Não faz nada — continua com a mensagem original
                  }

                  Alert.alert("Error", message);
                } else {
                  Alert.alert("Success", "Credentials submitted successfully.");
                  navigation.navigate("Home");
                  console.log("Response text:", text);
                }
              } catch (err) {
                console.error("Submission error:", err);
                Alert.alert("Error", );
              }
            },
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      console.error("QR parse error:", error);
      Alert.alert("Error", "Invalid QR code format.");
    }
  };

  return <QRCodeScanner onRead={handleRead} showMarker={true} />;
}