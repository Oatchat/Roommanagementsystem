// Normalize year to ค.ศ. so records stored as either พ.ศ. (2568) or ค.ศ. (2025)
// are comparable. Anything > 2400 is assumed to be พ.ศ.
export const toCE = (year) => {
  const n = Number(year);
  if (!Number.isFinite(n)) return '';
  return String(n > 2400 ? n - 543 : n);
};
