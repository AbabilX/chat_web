export type LocalMessagingDevice = {
  id: string;
  deviceId: string;
  privateKey: CryptoKey;
  publicKey: JsonWebKey;
  keyVersion: number;
  createdAt: number;
  rotatedAt: number;
};
