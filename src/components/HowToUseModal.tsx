import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from "react-native";
import { BlurView } from 'expo-blur';
import { horizontalScale, verticalScale, moderateScale } from "../utils/responsive";
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { X } from 'lucide-react-native';

interface HowToUseModalProps {
    visible: boolean;
    onClose: () => void;
}

/**
 * HowToUseModal
 * Displays a detailed guide on how to use FakeWalletHub.
 * Accessible from the Nav menu → "How To Use" item.
 */
export default function HowToUseModal({ visible, onClose }: HowToUseModalProps) {
    const { colors } = useTheme();
    const { t } = useLanguage();

    const steps = [
        { title: t('howToUseStep1Title'), desc: t('howToUseStep1Desc') },
        { title: t('howToUseStep2Title'), desc: t('howToUseStep2Desc') },
        { title: t('howToUseStep3Title'), desc: t('howToUseStep3Desc') },
        { title: t('howToUseStep4Title'), desc: t('howToUseStep4Desc') },
        { title: t('howToUseStep5Title'), desc: t('howToUseStep5Desc') },
    ];

    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            {/* Backdrop */}
            <BlurView
                intensity={30}
                tint="dark"
                style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.75)' }]}
            />

            {/* Card */}
            <View style={styles.overlay}>
                <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: colors.text }]}>
                            {t('howToUseTitle')}
                        </Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <X size={22} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    {/* Divider */}
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />

                    {/* Steps */}
                    <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollArea}>
                        {steps.map((step, index) => (
                            <View key={index} style={styles.stepRow}>
                                {/* Connector line */}
                                <View style={styles.stepLeft}>
                                    <View style={[styles.stepDot, { backgroundColor: colors.accent }]} />
                                    {index < steps.length - 1 && (
                                        <View style={[styles.stepLine, { backgroundColor: colors.accent + '30' }]} />
                                    )}
                                </View>

                                <View style={styles.stepContent}>
                                    <Text style={[styles.stepTitle, { color: colors.text }]}>
                                        {step.title}
                                    </Text>
                                    <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>
                                        {step.desc}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </ScrollView>

                    {/* Close Button */}
                    <TouchableOpacity
                        style={[styles.bottomBtn, { backgroundColor: colors.accent }]}
                        onPress={onClose}
                        activeOpacity={0.85}
                    >
                        <Text style={[styles.bottomBtnText, { color: colors.background }]}>
                            {t('close')}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: horizontalScale(20),
    },
    card: {
        width: '100%',
        borderRadius: moderateScale(20),
        padding: horizontalScale(22),
        borderWidth: 1,
        maxHeight: '80%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: moderateScale(16),
        elevation: 12,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(12),
    },
    title: {
        fontSize: moderateScale(17),
        fontWeight: 'bold',
        flex: 1,
        marginRight: horizontalScale(10),
    },
    closeBtn: {
        padding: 4,
    },
    divider: {
        height: 1,
        marginBottom: verticalScale(16),
        opacity: 0.5,
    },
    scrollArea: {
        maxHeight: '75%',
    },
    stepRow: {
        flexDirection: 'row',
        marginBottom: verticalScale(4),
    },
    stepLeft: {
        alignItems: 'center',
        marginRight: horizontalScale(14),
        width: horizontalScale(16),
    },
    stepDot: {
        width: moderateScale(12),
        height: moderateScale(12),
        borderRadius: moderateScale(6),
        marginTop: verticalScale(4),
    },
    stepLine: {
        flex: 1,
        width: 2,
        marginTop: verticalScale(4),
        marginBottom: verticalScale(-4),
        minHeight: verticalScale(20),
    },
    stepContent: {
        flex: 1,
        paddingBottom: verticalScale(18),
    },
    stepTitle: {
        fontSize: moderateScale(14),
        fontWeight: '700',
        marginBottom: verticalScale(4),
    },
    stepDesc: {
        fontSize: moderateScale(12),
        lineHeight: moderateScale(18),
    },
    bottomBtn: {
        marginTop: verticalScale(16),
        paddingVertical: verticalScale(12),
        borderRadius: moderateScale(12),
        alignItems: 'center',
    },
    bottomBtnText: {
        fontWeight: 'bold',
        fontSize: moderateScale(14),
    },
});
