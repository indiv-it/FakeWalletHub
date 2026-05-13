import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Standard design guide (e.g., iPhone 11)
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

/**
 * Scaling width based on screen width.
 * @param size - Size in pixels.
 * @returns Scaled size.
 */
const horizontalScale = (size: number): number =>
    (SCREEN_WIDTH / guidelineBaseWidth) * size;

/**
 * Scaling height based on screen height.
 * @param size - Size in pixels.
 * @returns Scaled size.
 */
const verticalScale = (size: number): number =>
    (SCREEN_HEIGHT / guidelineBaseHeight) * size;

/**
 * Moderately scaling the size (blend of both horizontal and vertical).
 * @param size - Size in pixels.
 * @param factor - Scaling factor (0.5 means 50% scaling).
 * @returns Scaled size.
 */
const moderateScale = (size: number, factor: number = 0.5): number =>
    size + (horizontalScale(size) - size) * factor;

/**
 * Normalizing font size based on pixel ratio.
 * @param size - Size in pixels.
 * @returns Normalized font size.
 */
const normalize = (size: number): number => {
    const newSize = (SCREEN_WIDTH / guidelineBaseWidth) * size;
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

export {
    horizontalScale,
    verticalScale,
    moderateScale,
    normalize,
    SCREEN_WIDTH,
    SCREEN_HEIGHT,
};
