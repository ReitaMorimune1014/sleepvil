import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRef } from 'react';
import { StyleSheet, View } from 'react-native';

import type { Barcode } from '../store/types';
import { AppButton } from '../ui/AppButton';
import { AppText } from '../ui/AppText';
import { spacing } from '../ui/theme';

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
        <AppText center>バーコードを読むために、カメラの使用を許可してください</AppText>
        {permission.canAskAgain ? (
          <AppButton title="許可する" onPress={requestPermission} />
        ) : (
          <AppText variant="muted" center>
            iPhoneの「設定」から、このアプリのカメラをオンにしてください
          </AppText>
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
    justifyContent: 'center',
    padding: spacing.l,
    gap: spacing.m,
  },
  camera: {
    flex: 1,
  },
});
