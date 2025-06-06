import { PermissionsAndroid, Platform, View, Text, Alert, Modal, TextInput , Button} from 'react-native';
import React, { useState, useEffect } from 'react';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';
import { PureNativeButton } from 'react-native-gesture-handler';

export default function CameraScreen() {
  const [hasPermission, setHasPermission] = useState(false);
  const [result, setResult] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [plateNumber, setPlateNumber] = useState('');
  const [pendingProof, setPendingProof] = useState(null);
  const [pendingPublicSignals, setPendingPublicSignals] = useState(null);


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
      console.log("Raw QR Code:", e.data);

      const parsedData = JSON.parse(e.data);

      const proof = parsedData.proof;
      const publicSignals = parsedData.publicSignals;

      // Guarda para usar depois no modal
      setPendingProof(proof);
      setPendingPublicSignals(publicSignals);
      setModalVisible(true);  // mostra o modal para pedir plateNumber

    } catch (err) {
      console.error('Invalid QR code:', err);
      setResult('❌ VP is INVALID.');
    }
  };

  const handleVerify = () => {
    if (!plateNumber) {
      Alert.alert("Verification Code Required", "Please enter the verification code to proceed.");
      return;
    }
    setModalVisible(false);
    console.log("🧾 Proof:", pendingProof);
    console.log("🔓 Public Signals:", pendingPublicSignals);
    console.log("🔑 Plate Number:", plateNumber);

    verifyVP(pendingProof, pendingPublicSignals, plateNumber);
  };

  const verifyVP = async (proof,pS,plateNumber) => {
    try {
      const response = await fetch('http://192.168.1.149:3030/verify-zkp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proof: proof,
          publicSignals: pS,
          plateNumber: plateNumber,
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
     <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{ flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'rgba(0,0,0,0.5)' }}>
          <View style={{ backgroundColor:'white', padding:20, borderRadius:10, width:'80%' }}>
            <Text style={{ color: 'black', marginBottom: 10 }}>
              Enter Verification Code (Plate Number/Policy Number/Card ID):
            </Text>
            <TextInput
              placeholder="Verification Code"
              placeholderTextColor="#555"  // cinza escuro para placeholder
              value={plateNumber}
              onChangeText={setPlateNumber}
              style={{ borderBottomWidth:1, marginBottom:20, padding:5, color: 'black' }} // texto input preto
            />
            <Button title="Verify" onPress={handleVerify} />
            <Button title="Cancel" onPress={() => setModalVisible(false)} color="red" />
          </View>
        </View>
      </Modal>
    </View>
    
  );
}
