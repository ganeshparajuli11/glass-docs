/** Passport-sheet layout math — pure and testable. Units: millimetres. */

export interface PhotoPreset {
  key: string;
  label: string;
  widthMm: number;
  heightMm: number;
}

export const PHOTO_PRESETS: PhotoPreset[] = [
  { key: "35x45", label: "35 × 45 mm (Nepal, EU, UK, India…)", widthMm: 35, heightMm: 45 },
  { key: "51x51", label: "2 × 2 in (US, 51 × 51 mm)", widthMm: 50.8, heightMm: 50.8 },
  { key: "40x60", label: "40 × 60 mm", widthMm: 40, heightMm: 60 },
];

export interface SheetPreset {
  key: string;
  label: string;
  widthMm: number;
  heightMm: number;
}

export const SHEET_PRESETS: SheetPreset[] = [
  { key: "4x6", label: "4 × 6 in photo paper", widthMm: 152.4, heightMm: 101.6 },
  { key: "a4", label: "A4 paper", widthMm: 210, heightMm: 297 },
];

export interface SheetLayout {
  cols: number;
  rows: number;
  count: number;
  /** Top-left positions of each photo in mm. */
  positions: Array<{ x: number; y: number }>;
}

export const MARGIN_MM = 4;
export const GAP_MM = 2;

export function layoutSheet(
  photo: { widthMm: number; heightMm: number },
  sheet: { widthMm: number; heightMm: number },
): SheetLayout {
  const availW = sheet.widthMm - MARGIN_MM * 2;
  const availH = sheet.heightMm - MARGIN_MM * 2;
  const cols = Math.max(0, Math.floor((availW + GAP_MM) / (photo.widthMm + GAP_MM)));
  const rows = Math.max(0, Math.floor((availH + GAP_MM) / (photo.heightMm + GAP_MM)));
  const positions: Array<{ x: number; y: number }> = [];
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      positions.push({
        x: MARGIN_MM + c * (photo.widthMm + GAP_MM),
        y: MARGIN_MM + r * (photo.heightMm + GAP_MM),
      });
    }
  }
  return { cols, rows, count: cols * rows, positions };
}

export const MM_TO_PX_300DPI = 300 / 25.4;
