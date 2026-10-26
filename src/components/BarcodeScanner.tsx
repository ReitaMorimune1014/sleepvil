import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRef } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

import type { Barcode } from '../store/types';

type Props = {
  /** 読み取ったときに1回だけ呼ばれる。もう一度読むときは、この部品を作り直す(key を変える) */
  onScanned: (barcode: Barcode) => void;
};

/** カメラの許可を確認し、バーコードを1つ読み取る部品。映像は保存しない */
export function BarcodeScanner({ onScanned }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  // カメラは同じコードを連続で通知するため、最初の1回だけ受け取る
  const scannedRef = useRef(false);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>バーコードを読むために、カメラの使用を許可してください</Text>
        {permission.canAskAgain ? (
          <Button title="許可する" onPress={requestPermission} />
        ) : (
          <Text style={styles.message}>iPhoneの「設定」から、このアプリのカメラをオンにしてください</Text>
        )}
      </View>
    );
  }

  return (
    <CameraView
      style={styles.camera}
      facing="back"
      onBarcodeScanned={(result) => {
        if (scannedRef.current) {
          return;
        }
        scannedRef.current = true;
        onScanned({ type: result.type, data: result.data });
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  camera: {
    flex: 1,
  },
  message: {
    fontSize: 20,
    textAlign: 'center',
  },
});
