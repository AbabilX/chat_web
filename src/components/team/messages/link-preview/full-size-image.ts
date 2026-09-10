/** Below this in either direction there is not enough image to lead with. */
const MINIMUM_FULL_SIZE_DIMENSION = 200;

/** Within 5% of 1:1. Signal's `isRoughlySquare`. */
function isRoughlySquare(width: number, height: number) {
  return Math.abs(1 - width / height) < 0.05;
}

/**
 * Whether a preview image leads the card at full width or sits as a 72px
 * thumbnail — Signal's `shouldUseFullSizeLinkPreviewImage`.
 *
 * The square test is what carries it: an og:image that is square is almost
 * always a site logo, and a logo stretched across the bubble reads as a broken
 * hero rather than a brand mark.
 */
export function isFullSizePreviewImage(width: number, height: number) {
  if (!width || !height) return false;
  if (width < MINIMUM_FULL_SIZE_DIMENSION || height < MINIMUM_FULL_SIZE_DIMENSION) return false;
  return !isRoughlySquare(width, height);
}
