import { MISSION_DEADLINE_MINUTES } from '../config/mission';
import type { Barcode } from '../store/types';

/** スキャン結果の判定 */
export type ScanResult = 'success' | 'past_deadline' | 'wrong_code';

/**
 * 登録したバーコードと一致するか。
 * iOSでは同じ商品が UPC-A / EAN-13 のどちらでも読まれうるため、種類は比べず中身だけで照合する。
 */
export function isSameBarcode(registered: Barcode, scannedData: string): boolean {
  return registered.data === scannedData;
}

/**
 * 締め切り(目標時刻+MISSION_DEADLINE_MINUTES)までか。
 * 目標より前の時刻は、早起きとして締め切り内に含める。
 * 日付は端末のローカル日付で区切り、0時をまたぐ場合は考慮しない(MVPの方針)。
 */
export function isWithinDeadline(targetMinutes: number, nowMinutes: number): boolean {
  return nowMinutes <= targetMinutes + MISSION_DEADLINE_MINUTES;
}

/**
 * 起床ミッションでスキャンしたときの判定。
 * 締め切りを過ぎていたら、コードに関係なく past_deadline(その日は記録しない)。
 */
export function evaluateScan(
  registered: Barcode,
  scannedData: string,
  targetMinutes: number,
  nowMinutes: number,
): ScanResult {
  if (!isWithinDeadline(targetMinutes, nowMinutes)) {
    return 'past_deadline';
  }
  return isSameBarcode(registered, scannedData) ? 'success' : 'wrong_code';
}
