import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Animated,
    Dimensions
} from 'react-native';
import { BlurView } from 'expo-blur';
import { horizontalScale, verticalScale, moderateScale } from '../utils/responsive';

// --- Icons ---
import { AlertCircle, CheckCircle2, AlertTriangle, Info } from 'lucide-react-native';

// --- Theme & Context ---
import { SIZES, FONTS, CARD_SHADOW, COLORS } from '../style/Theme';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const { width } = Dimensions.get('window');

/**
 * AlertPopup Component
 * Displays a customizable alert modal with animations and theme support.
 * Types supported: 'success', 'warning', 'error', 'info'
 */
export default function AlertPopup({
    visible,
    title,
    description,
    onClose,
    buttonText,
    type = 'warning' 
}) {
    // --- Contexts ---
    const { colors } = useTheme();
    const { t } = useLanguage();
    
    // --- State & Defaults ---
    // Use translations as default text if none are provided
    const displayTitle = title || t('notifications');
    const displayDescription = description || '';
    const displayButtonText = buttonText || t('ok');
    
    // Animation Values
    const scaleValue = useRef(new Animated.Value(0)).current;
    const opacityValue = useRef(new Animated.Value(0)).current;

    // --- Animation Logic ---
    useEffect(() => {
        if (visible) {
            // Animate in: zoom and fade in
            Animated.parallel([
                Animated.spring(scaleValue, {
                    toValue: 1,
                    useNativeDriver: true,
                    tension: 50,
                    friction: 7
                }),
                Animated.timing(opacityValue, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true
                })
            ]).start();
        } else {
            // Animate out: slightly zoom out and fade out
            Animated.parallel([
                Animated.timing(scaleValue, {
                    toValue: 0.8,
                    duration: 200,
                    useNativeDriver: true
                }),
                Animated.timing(opacityValue, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true
                })
            ]).start();
        }
    }, [visible]);

    // Avoid rendering completely if not visible
    if (!visible) return null;

    // --- Helper Functions ---
    /**
     * Determines the icon and color based on the alert type
     * @returns {Object} { Icon, color }
     */
    const getIconConfig = () => {
        switch (type) {
            case 'success':
                return { Icon: CheckCircle2, color: '#00bd19' }; // Green
            case 'error':
                return { Icon: AlertCircle, color: colors.red || '#EF4444' }; // Red
            case 'info':
                return { Icon: Info, color: '#3B82F6' }; // Blue
            case 'warning':
            default:
                return { Icon: AlertTriangle, color: '#F59E0B' }; // Orange/Yellow
        }
    };

    const { Icon, color: typeColor } = getIconConfig();
    const blurTint = colors.background === '#111827' ? 'dark' : 'dark';

    // --- Render ---
    return (
        <Modal transparent visible={visible} animationType="fade" hardwareAccelerated>
            <BlurView intensity={30} tint={blurTint} style={styles.blurContainer}>
                <Animated.View
                    style={[
                        styles.popupCard,
                        {
                            backgroundColor: colors.cardBg,
                            transform: [{ scale: scaleValue }],
                            opacity: opacityValue
                        }
                    ]}
                >
                    {/* Icon Section */}
                    <View style={styles.iconContainer}>
                        <View style={[styles.iconCircle, { backgroundColor: typeColor + '15' }]}>
                            <Icon size={36} color={typeColor} strokeWidth={2.5} />
                        </View>
                    </View>
                    
                    {/* Text Section */}
                    <Text style={[styles.title, { color: colors.text }]}>{displayTitle}</Text>
                    <Text style={[styles.description, { color: colors.gray }]}>{displayDescription}</Text>
                    
                    {/* Button Section */}
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: typeColor }]}
                            onPress={onClose}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.btnText, styles.confirmBtnText]}>{displayButtonText}</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </BlurView>
        </Modal>
    );
}

// --- Styles ---
const styles = StyleSheet.create({
    blurContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    popupCard: {
        width: '82%',
        maxWidth: horizontalScale(340),
        borderRadius: moderateScale(24),
        padding: horizontalScale(24),
        alignItems: 'center',
        ...CARD_SHADOW,
        elevation: 10,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    iconContainer: {
        marginBottom: verticalScale(20),
    },
    iconCircle: {
        width: horizontalScale(72),
        height: horizontalScale(72),
        borderRadius: moderateScale(36),
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: moderateScale(20),
        fontWeight: FONTS.bold,
        marginBottom: verticalScale(10),
        textAlign: 'center',
    },
    description: {
        fontSize: SIZES.sm,
        textAlign: 'center',
        marginBottom: verticalScale(24),
        lineHeight: moderateScale(22),
        paddingHorizontal: horizontalScale(8),
    },
    buttonContainer: {
        flexDirection: 'row',
        width: '100%',
    },
    button: {
        flex: 1,
        height: verticalScale(52),
        borderRadius: moderateScale(14),
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnText: {
        fontSize: moderateScale(15),
        fontWeight: FONTS.bold,
    },
    confirmBtnText: {
        color: '#FFFFFF',
    }
});
