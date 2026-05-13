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
import { AlertCircle, CheckCircle2, AlertTriangle, Info } from 'lucide-react-native';
import { SIZES, FONTS, CARD_SHADOW, COLORS } from '../style/Theme';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

// --- Types ---
interface AlertPopupProps {
    visible: boolean;
    title?: string;
    description?: string;
    onClose: () => void;
    buttonText?: string;
    type?: 'success' | 'warning' | 'error' | 'info';
}

/**
 * AlertPopup Component
 * Displays a customizable alert modal with animations and theme support.
 */
export default function AlertPopup({
    visible, title, description, onClose, buttonText, type = 'warning'
}: AlertPopupProps) {
    const { colors } = useTheme();
    const { t } = useLanguage();

    const displayTitle = title || t('notifications');
    const displayDescription = description || '';
    const displayButtonText = buttonText || t('ok');

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

    const getIconConfig = () => {
        switch (type) {
            case 'success': return { Icon: CheckCircle2, color: '#00bd19' };
            case 'error': return { Icon: AlertCircle, color: colors.red || '#EF4444' };
            case 'info': return { Icon: Info, color: '#3B82F6' };
            case 'warning':
            default: return { Icon: AlertTriangle, color: '#F59E0B' };
        }
    };

    const { Icon, color: typeColor } = getIconConfig();

    return (
        <Modal transparent visible={visible} animationType="fade" hardwareAccelerated>
            <BlurView intensity={30} tint="dark" style={styles.blurContainer}>
                <Animated.View style={[styles.popupCard, { backgroundColor: colors.cardBg, transform: [{ scale: scaleValue }], opacity: opacityValue }]}>
                    <View style={{ marginBottom: verticalScale(20) }}>
                        <View style={[styles.iconCircle, { backgroundColor: typeColor + '15' }]}>
                            <Icon size={36} color={typeColor} strokeWidth={2.5} />
                        </View>
                    </View>
                    <Text style={[styles.title, { color: colors.text }]}>{displayTitle}</Text>
                    <Text style={[styles.description, { color: colors.gray }]}>{displayDescription}</Text>
                    <View style={{ flexDirection: 'row', width: '100%' }}>
                        <TouchableOpacity style={[styles.button, { backgroundColor: typeColor }]} onPress={onClose} activeOpacity={0.7}>
                            <Text style={{ color: '#fff', fontSize: moderateScale(15), fontWeight: FONTS.bold }}>{displayButtonText}</Text>
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
    button: { flex: 1, height: verticalScale(52), borderRadius: moderateScale(14), justifyContent: 'center', alignItems: 'center' },
});
