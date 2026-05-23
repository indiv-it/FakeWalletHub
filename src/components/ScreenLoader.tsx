import { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { moderateScale } from '../utils/responsive';

interface ScreenLoaderProps {
    /** Whether the loader is visible */
    visible: boolean;
}

/**
 * ScreenLoader Component
 * A lightweight pulsing spinner overlay shown inside a screen while data is loading.
 * Uses the app accent color and animates smoothly in/out.
 */
export default function ScreenLoader({ visible }: ScreenLoaderProps) {
    const { colors } = useTheme();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    // Fade + scale in/out when visibility changes
    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: visible ? 1 : 0,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: visible ? 1 : 0.8,
                friction: 8,
                tension: 80,
                useNativeDriver: true,
            }),
        ]).start();
    }, [visible]);

    // Continuous pulse ring animation
    useEffect(() => {
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.4, duration: 700, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
            ])
        );
        loop.start();
        return () => loop.stop();
    }, []);

    if (!visible) return null;

    return (
        <Animated.View style={[styles.overlay, { opacity: fadeAnim, pointerEvents: 'auto' }]}>
            <Animated.View style={[styles.card, {
                backgroundColor: colors.cardBg,
                borderColor: colors.border,
                transform: [{ scale: scaleAnim }],
            }]}>
                {/* Outer pulse ring */}
                <Animated.View style={[
                    styles.ring,
                    {
                        borderColor: colors.accent + '40',
                        transform: [{ scale: pulseAnim }],
                    },
                ]} />
                {/* Inner spinning dot */}
                <View style={[styles.dot, { backgroundColor: colors.accent }]} />
            </Animated.View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
        backgroundColor: 'transparent',
    } as any,
    card: {
        width: moderateScale(64),
        height: moderateScale(64),
        borderRadius: moderateScale(32),
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    ring: {
        position: 'absolute',
        width: moderateScale(56),
        height: moderateScale(56),
        borderRadius: moderateScale(28),
        borderWidth: 2,
    },
    dot: {
        width: moderateScale(14),
        height: moderateScale(14),
        borderRadius: moderateScale(7),
    },
});
