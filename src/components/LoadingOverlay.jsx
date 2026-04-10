import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions, Image, Text } from 'react-native';
import { horizontalScale, verticalScale, moderateScale } from '../utils/responsive';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

/**
 * LoadingOverlay Component
 * Displays a full-screen loading animation with a glowing rotating orb and a logo.
 */
export default function LoadingOverlay() {
    // --- Animation State ---
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;

    // --- Animation Logic ---
    useEffect(() => {
        // Continuous pulse animation (scaling up and down)
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.15,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // Continuous rotation for outer glow ring
        Animated.loop(
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 4000,
                useNativeDriver: true,
            })
        ).start();
    }, []);

    // Interpolate rotation value from 0-1 to degrees
    const rotation = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    // --- Render ---
    return (
        <View style={styles.container}>
            {/* Dark Gradient Background */}
            <LinearGradient
                colors={['#0a0a0a', '#111827', '#1a1a2e']}
                style={styles.background}
            />
            
            {/* Main Content Area */}
            <View style={styles.content}>
                {/* Glowing rotating outer ring */}
                <Animated.View
                    style={[
                        styles.glowOrb,
                        {
                            transform: [{ rotate: rotation }, { scale: pulseAnim }],
                        },
                    ]}
                >
                    <View style={styles.glowInner} />
                </Animated.View>

                {/* Center Logo pulsating */}
                <Animated.View style={[styles.logoContainer, { transform: [{ scale: pulseAnim }] }]}>
                    <Image source={require('../imgs/Logo_FWH.png')} style={styles.logoImage} />
                </Animated.View>
                
            </View>
            
            {/* Loading Text */}
            <Text style={styles.loadingText}>Loading...</Text>
        </View>
    );
}

// --- Styles ---
const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        backgroundColor: '#0a0a0a',
    },
    background: {
        ...StyleSheet.absoluteFillObject,
    },
    content: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    glowOrb: {
        position: 'absolute',
        width: horizontalScale(140),
        height: horizontalScale(140),
        borderRadius: moderateScale(70),
        borderWidth: 2,
        borderColor: '#ACF532',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
    },
    glowInner: {
        width: horizontalScale(100),
        height: horizontalScale(100),
        borderRadius: moderateScale(50),
        backgroundColor: '#ACF53215',
    },
    logoContainer: {
        width: horizontalScale(100),
        height: horizontalScale(100),
        borderRadius: moderateScale(50),
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
    },
    logoImage: {
        width: horizontalScale(60),
        height: horizontalScale(60),
    },
    loadingText: {
        marginTop: verticalScale(50),
        color: '#ACF532',
        fontSize: moderateScale(16),
        fontWeight: '600',
        letterSpacing: 2,
        zIndex: 2,
    },
});
