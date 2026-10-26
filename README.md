# sleepvil

起床を習慣化するiOSアプリ。起床時に登録したバーコードをスキャンすると、村が発展する。

## 状態

開発中(M0: Expoの初期化)。要件は [docs/REQUIREMENTS.md](docs/REQUIREMENTS.md)、進め方は [docs/ROADMAP.md](docs/ROADMAP.md) を参照。

## 起動方法

前提: Node.js、iPhoneに Expo Go アプリ

```bash
npm install
npx expo start
```

表示されたQRコードを iPhone のカメラで読み取り、Expo Go で開く。

型チェック:

```bash
npx tsc --noEmit
```
