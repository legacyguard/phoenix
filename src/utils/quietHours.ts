export function isWithinQuietHours(startHHMM: string, endHHMM: string, now: Date = new Date()): boolean {
  const [sH, sM] = startHHMM.split(":").map(Number);
  const [eH, eM] = endHHMM.split(":").map(Number);
  if (Number.isNaN(sH) || Number.isNaN(sM) || Number.isNaN(eH) || Number.isNaN(eM)) return false;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = sH * 60 + sM;
  const endMinutes = eH * 60 + eM;
  if (startMinutes <= endMinutes) {
    return nowMinutes >= startMinutes && nowMinutes < endMinutes;
  } else {
    return nowMinutes >= startMinutes || nowMinutes < endMinutes;
  }
}


