import { PermissionsAndroid, Platform, View, Text, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';

export default function CameraScreen() {
  const [hasPermission, setHasPermission] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const requestPermission = async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
        );
        setHasPermission(granted === PermissionsAndroid.RESULTS.GRANTED);
      } else {
        setHasPermission(true);
      }
    };
    requestPermission();
  }, []);

  const onSuccess = (e) => {
    try {
      console.log('Raw QR Code:', e.data);
      const parsedData = JSON.parse(e.data);
      // Extrai apenas o valor do _j, se existir
      const vp = parsedData._j || parsedData;
      verifyVP(vp);
    } catch (err) {
      console.error('Invalid QR code:', err);
      setResult('❌ VP is INVALID.');
    }
  };

  const verifyVP = async (vp) => {
    try {
      console.log('Verifying VP:', JSON.stringify(vp, null, 2));
      const response = await fetch('http://192.168.1.149:3030/verify-vp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verifiablePresentation: vp,
          challenge: vp?.proof?.challenge || 'abc123', // fallback
        }),
      });

      // Se falhar no HTTP (status >= 400), tratamos como inválido direto:
      if (!response.ok) {
        console.warn('HTTP error during VP verification:', response.status);
        setResult('❌ VP is INVALID.');
        return;
      }

      const resultJson = await response.json();
      // Se o servidor retornou verified: true, mostramos “VALID”,
      // caso contrário, “INVALID”.
      setResult(resultJson.verified ? '✅ VP is VALID!' : '❌ VP is INVALID.');
    } catch (err) {
      console.error('Error verifying VP:', err);
      // Qualquer erro na rede ou parsing, tratamos como inválido:
      setResult('❌ VP is INVALID.');
    }
  };

  if (!hasPermission) {
    return (
      <View>
        <Text>Solicitando permissão da câmera...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <QRCodeScanner
        onRead={onSuccess}
        flashMode={RNCamera.Constants.FlashMode.auto}
        reactivate={true}
        reactivateTimeout={2000}
        showMarker={true}
      />
      {result !== null && (
        <View
          style={{
            flex: 1,
            justifyContent: 'flex-end',
            alignItems: 'center',
            paddingBottom: 30,
          }}
        >
          <Text style={{ color: '#000000', fontSize: 28 }}>{result}</Text>
        </View>
      )}
    </View>
  );
}
