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
import { AlertCircle } from 'lucide-react-native';

// --- Theme & Context ---
import { SIZES, FONTS, CARD_SHADOW, COLORS } from '../style/Theme';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const { width } = Dimensions.get('window');

/**
 * ConfirmPopup Component
 * Displays a modal for user confirmation (e.g., deleting an item) with animations.
 */
export default function ConfirmPopup({
    visible,
    title,
    description,
    onCancel,
    onConfirm,
    confirmText,
    cancelText
}) {
    // --- Contexts ---
    const { colors } = useTheme();
    const { t } = useLanguage();
    
    // --- State & Defaults ---
    // Use translations as defaults if custom text is not provided
    const displayTitle = title || t('confirmDelete');
    const displayDescription = description || t('confirmDeleteDesc');
    const displayConfirmText = confirmText || t('deleteData');
    const displayCancelText = cancelText || t('cancel');
    
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
            // Animate out: slight zoom out and fade out
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

    // --- Dynamic Styles ---
    // Use a slightly varied blur tint based on theme, or force "dark" 
    const blurTint = colors.background === '#111827' ? 'dark' : 'dark'; // Always keep dark blur background

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
                        <View style={[styles.iconCircle, { backgroundColor: colors.red + '15' }]}>
                            <AlertCircle size={36} color={colors.red} strokeWidth={2.5} />
                        </View>
                    </View>
                    
                    {/* Text Section */}
                    <Text style={[styles.title, { color: colors.text }]}>{displayTitle}</Text>
                    <Text style={[styles.description, { color: colors.gray }]}>{displayDescription}</Text>
                    
                    {/* Buttons Section */}
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelBtn, { borderColor: colors.border }]}
                            onPress={onCancel}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.btnText, { color: colors.text }]}>{displayCancelText}</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                            style={[styles.button, styles.confirmBtn, { backgroundColor: colors.red }]}
                            onPress={onConfirm}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.btnText, styles.confirmBtnText]}>{displayConfirmText}</Text>
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
        backgroundColor: 'rgba(0,0,0,0.1)', // transparent enough for blur
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
        justifyContent: 'space-between',
        gap: horizontalScale(12),
    },
    button: {
        flex: 1,
        height: verticalScale(52),
        borderRadius: moderateScale(14),
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelBtn: {
        borderWidth: 1.5,
        backgroundColor: 'transparent',
    },
    confirmBtn: {
        // backgroundColor set by inline style
    },
    btnText: {
        fontSize: moderateScale(15),
        fontWeight: FONTS.bold,
    },
    confirmBtnText: {
        color: '#FFFFFF',
    }
});
