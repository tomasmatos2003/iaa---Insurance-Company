// src/utils/permissions.js
import { Platform } from "react-native";
import { check, request, PERMISSIONS, RESULTS } from "react-native-permissions";

export async function requestCameraPermission() {
  if (Platform.OS === "android") {
    const status = await request(PERMISSIONS.ANDROID.CAMERA);
    return status === RESULTS.GRANTED;
  } else {
    const status = await request(PERMISSIONS.IOS.CAMERA);
    return status === RESULTS.GRANTED;
  }
}