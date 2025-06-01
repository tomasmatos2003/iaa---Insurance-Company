import React, { useState } from 'react';
import { Alert } from 'react-native';
import CameraKitCameraScreen from 'react-native-camera-kit';
import { storeVc } from '../utils/storage';

export default function ScanScreen({ navigation }) {
  const [scanned, setScanned] = useState(false);

  const onReadCode = async (event) => {
    if (scanned) return;
    setScanned(true);
    try {
      const vc = JSON.parse(event.nativeEvent.codeStringValue);
      await storeVc(vc);
      Alert.alert('Success', 'VC saved to wallet');
      navigation.navigate('VCs');
    } catch (e) {
      Alert.alert('Error', 'Invalid VC QR');
    }
  };

  return (
    <CameraKitCameraScreen
      scanBarcode
      onReadCode={onReadCode}
      showFrame
      laserColor="red"
      frameColor="white"
    />
  );
}
