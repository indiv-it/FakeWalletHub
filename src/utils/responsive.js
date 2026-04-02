import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Standard design guide (e.g., iPhone 11)
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

/**
 * Scaling width based on screen width.
 * @param {number} size - Size in pixels.
 * @returns {number} - Scaled size.
 */
const horizontalScale = (size) => (SCREEN_WIDTH / guidelineBaseWidth) * size;

/**
 * Scaling height based on screen height.
 * @param {number} size - Size in pixels.
 * @returns {number} - Scaled size.
 */
const verticalScale = (size) => (SCREEN_HEIGHT / guidelineBaseHeight) * size;

/**
 * Moderately scaling the size (blend of both horizontal and vertical).
 * This is useful for font sizes, border radii, etc.
 * @param {number} size - Size in pixels.
 * @param {number} [factor=0.5] - Scaling factor (0.5 means it scales 50% as much).
 * @returns {number} - Scaled size.
 */
const moderateScale = (size, factor = 0.5) => size + (horizontalScale(size) - size) * factor;

/**
 * Normalizing font size based on pixel ratio.
 * @param {number} size - Size in pixels.
 * @returns {number} - Normalized font size.
 */
const normalize = (size) => {
  const newSize = (SCREEN_WIDTH / guidelineBaseWidth) * size;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

export { horizontalScale, verticalScale, moderateScale, normalize, SCREEN_WIDTH, SCREEN_HEIGHT };
