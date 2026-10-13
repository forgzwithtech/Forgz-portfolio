export type Pt = [number, number];

/** Solve the 3x3 homography mapping four source points onto four destination points. */
export function homography(src: Pt[], dst: Pt[]): number[] {
  const A: number[][] = [];
  for (let i = 0; i < 4; i++) {
    const [x, y] = src[i];
    const [u, v] = dst[i];
    A.push([x, y, 1, 0, 0, 0, -u * x, -u * y, u]);
    A.push([0, 0, 0, x, y, 1, -v * x, -v * y, v]);
  }
  for (let i = 0; i < 8; i++) {
    let m = i;
    for (let j = i + 1; j < 8; j++) if (Math.abs(A[j][i]) > Math.abs(A[m][i])) m = j;
    [A[i], A[m]] = [A[m], A[i]];
    for (let j = i + 1; j < 8; j++) {
      const f = A[j][i] / A[i][i];
      for (let k = i; k < 9; k++) A[j][k] -= f * A[i][k];
    }
  }
  const h: number[] = [];
  for (let i = 7; i >= 0; i--) {
    let s = A[i][8];
    for (let j = i + 1; j < 8; j++) s -= A[i][j] * h[j];
    h[i] = s / A[i][i];
  }
  return h;
}

/** CSS matrix3d() string for a homography from {@link homography}. */
export function matrix3d(h: number[]): string {
  const v = [h[0], h[3], 0, h[6], h[1], h[4], 0, h[7], 0, 0, 1, 0, h[2], h[5], 0, 1];
  return 'matrix3d(' + v.map((n) => +n.toFixed(7)).join(',') + ')';
}

export const rectPts = (w: number, h: number): Pt[] => [
  [0, 0],
  [w, 0],
  [w, h],
  [0, h],
];
