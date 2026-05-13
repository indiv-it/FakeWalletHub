import { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Animated,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { horizontalScale, verticalScale, moderateScale } from '../utils/responsive';
import { AlertCircle } from 'lucide-react-native';
import { SIZES, FONTS, CARD_SHADOW, COLORS } from '../style/Theme';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

// --- Types ---
interface ConfirmPopupProps {
    visible: boolean;
    title?: string;
    description?: string;
    onCancel: () => void;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
}

/**
 * ConfirmPopup Component
 * Displays a modal for user confirmation (e.g., deleting an item) with animations.
 */
export default function ConfirmPopup({
    visible, title, description, onCancel, onConfirm, confirmText, cancelText
}: ConfirmPopupProps) {
    const { colors } = useTheme();
    const { t } = useLanguage();

    const displayTitle = title || t('confirmDelete');
    const displayDescription = description || t('confirmDeleteDesc');
    const displayConfirmText = confirmText || t('deleteData');
    const displayCancelText = cancelText || t('cancel');

    const scaleValue = useRef(new Animated.Value(0)).current;
    const opacityValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(scaleValue, { toValue: 1, useNativeDriver: true, tension: 50, friction: 7 }),
                Animated.timing(opacityValue, { toValue: 1, duration: 200, useNativeDriver: true }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(scaleValue, { toValue: 0.8, duration: 200, useNativeDriver: true }),
                Animated.timing(opacityValue, { toValue: 0, duration: 200, useNativeDriver: true }),
            ]).start();
        }
    }, [visible]);

    if (!visible) return null;

    return (
        <Modal transparent visible={visible} animationType="fade" hardwareAccelerated>
            <BlurView intensity={30} tint="dark" style={styles.blurContainer}>
                <Animated.View style={[styles.popupCard, { backgroundColor: colors.cardBg, transform: [{ scale: scaleValue }], opacity: opacityValue }]}>
                    <View style={{ marginBottom: verticalScale(20) }}>
                        <View style={[styles.iconCircle, { backgroundColor: colors.red + '15' }]}>
                            <AlertCircle size={36} color={colors.red} strokeWidth={2.5} />
                        </View>
                    </View>
                    <Text style={[styles.title, { color: colors.text }]}>{displayTitle}</Text>
                    <Text style={[styles.description, { color: colors.gray }]}>{displayDescription}</Text>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={[styles.button, styles.cancelBtn, { borderColor: colors.border }]} onPress={onCancel} activeOpacity={0.7}>
                            <Text style={[styles.btnText, { color: colors.text }]}>{displayCancelText}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.button, { backgroundColor: colors.red }]} onPress={onConfirm} activeOpacity={0.7}>
                            <Text style={[styles.btnText, { color: '#fff' }]}>{displayConfirmText}</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </BlurView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    blurContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
    popupCard: { width: '82%', maxWidth: horizontalScale(340), borderRadius: moderateScale(24), padding: horizontalScale(24), alignItems: 'center', ...CARD_SHADOW, elevation: 10, borderWidth: 1, borderColor: COLORS.border },
    iconCircle: { width: horizontalScale(72), height: horizontalScale(72), borderRadius: moderateScale(36), justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: moderateScale(20), fontWeight: FONTS.bold, marginBottom: verticalScale(10), textAlign: 'center' },
    description: { fontSize: SIZES.sm, textAlign: 'center', marginBottom: verticalScale(24), lineHeight: moderateScale(22), paddingHorizontal: horizontalScale(8) },
    buttonContainer: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', gap: horizontalScale(12) },
    button: { flex: 1, height: verticalScale(52), borderRadius: moderateScale(14), justifyContent: 'center', alignItems: 'center' },
    cancelBtn: { borderWidth: 1.5, backgroundColor: 'transparent' },
    btnText: { fontSize: moderateScale(15), fontWeight: FONTS.bold },
});
