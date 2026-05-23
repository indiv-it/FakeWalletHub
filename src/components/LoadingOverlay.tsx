import { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Image } from 'react-native';
import { horizontalScale, verticalScale, moderateScale } from '../utils/responsive';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * App launch splash — full-screen branded loader shown while the app initializes.
 */
export default function LoadingOverlay() {
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.15, duration: 1000, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
            ])
        ).start();

        Animated.loop(
            Animated.timing(rotateAnim, { toValue: 1, duration: 4000, useNativeDriver: true })
        ).start();
    }, []);

    const rotation = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#0a0a0a', '#111827', '#1a1a2e']} style={{ ...StyleSheet.absoluteFillObject }} />
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <Animated.View style={[styles.glowOrb, { transform: [{ rotate: rotation }, { scale: pulseAnim }] }]}>
                    <View style={styles.glowInner} />
                </Animated.View>
                <Animated.View style={[styles.logoContainer, { transform: [{ scale: pulseAnim }] }]}>
                    <Image source={require('../imgs/Logo_FWH.png')} style={{ width: horizontalScale(60), height: horizontalScale(60) }} />
                </Animated.View>
            </View>
            <Animated.Text style={[styles.loadingText, { opacity: pulseAnim }]}>
                FakeWalletHub
            </Animated.Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', zIndex: 9999, backgroundColor: '#0a0a0a' },
    glowOrb: { position: 'absolute', width: horizontalScale(140), height: horizontalScale(140), borderRadius: moderateScale(70), borderWidth: 2, borderColor: '#ACF532', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center' },
    glowInner: { width: horizontalScale(100), height: horizontalScale(100), borderRadius: moderateScale(50), backgroundColor: '#ACF53215' },
    logoContainer: { width: horizontalScale(100), height: horizontalScale(100), borderRadius: moderateScale(50), backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', zIndex: 2 },
    loadingText: { marginTop: verticalScale(50), color: '#ACF532', fontSize: moderateScale(16), fontWeight: '600', letterSpacing: 2, zIndex: 2 },
});
