import React from "react";
import { Alert } from "react-native";
import QRCodeScanner from "react-native-qrcode-scanner";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function TestCamera({ navigation }) {
const handleRead = async ({ data }) => {
  try {
    const parsedVC = JSON.parse(data);

    // Extract VC type name (second entry in type array)
    const vcType = Array.isArray(parsedVC.type) && parsedVC.type.length > 1
      ? parsedVC.type[1]
      : "UnknownCredential";

    const key = `vc_${vcType}`;
    await AsyncStorage.setItem(key, JSON.stringify(parsedVC));

    Alert.alert("Saved", `${vcType} stored successfully.`);
    console.log()
    navigation.navigate("VCs");
  } catch (error) {
    Alert.alert("Error", "Invalid QR code or VC data.");
  }
  };

  return <QRCodeScanner onRead={handleRead} showMarker={true}/>;
}
