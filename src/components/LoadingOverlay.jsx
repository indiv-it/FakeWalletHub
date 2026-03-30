import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions, Image, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function LoadingOverlay() {
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Continuous pulse animation
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

        // Continuous rotation for outer glow
        Animated.loop(
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 4000,
                useNativeDriver: true,
            })
        ).start();
    }, []);

    const rotation = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#0a0a0a', '#111827', '#1a1a2e']}
                style={styles.background}
            />
            
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

                {/* Center Logo */}
                <Animated.View style={[styles.logoContainer, { transform: [{ scale: pulseAnim }] }]}>
                    <Image source={require('../imgs/Logo_FWH.png')} style={styles.logoImage} />
                </Animated.View>
                
            </View>
            {/* Loading text */}
            <Text style={styles.loadingText}>Loading...</Text>
        </View>
    );
}

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
        width: 140,
        height: 140,
        borderRadius: 70,
        borderWidth: 2,
        borderColor: '#ACF532',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
    },
    glowInner: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#ACF53215',
    },
    logoContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
    },
    logoImage: {
        width: 60,
        height: 60,
    },
    loadingText: {
        marginTop: 50,
        color: '#ACF532',
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 2,
        zIndex: 2,
    },
});
