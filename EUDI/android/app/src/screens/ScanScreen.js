import React from "react";
import { View, Text, Pressable } from "react-native";
import { Link } from "@react-navigation/native";
import QRCodeScanner from "react-native-qrcode-scanner";
import { RNCamera } from "react-native-camera";

export default function TestCamera() {

  return (
    <QRCodeScanner
        onRead={({data}) => alert(data)}
        
      />
  );
}