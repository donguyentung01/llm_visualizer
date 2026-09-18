// Map a token probability (0..1) to a translucent red->green tint for its chip.
//
// GAMMA > 1 spreads out the high-confidence range. Qwen is confident most of the
// time (tokens cluster at 0.85-1.0), so a linear map paints everything green.
// GAMMA = 3 pushes 0.9 toward yellow and 0.7 toward orange so the gradient reads.
// For a rambly model like GPT-2 you'd want GAMMA < 1 instead.
//
// The tint is alpha-composited over the chip background, so it works in both
// light and dark themes without needing to know which one is active.
const GAMMA = 3;

export function probToColor(p: number, alpha = 0.2): string {
  const c = Math.min(1, Math.max(0, p));
  const hue = 120 * c ** GAMMA; // 0 = red, 120 = green
  return `hsla(${hue.toFixed(0)} 72% 45% / ${alpha})`;
}
