import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

// components
import { COLORS, SIZES, FONTS, CARD_SHADOW } from '../../style/Theme';
import {useTheme} from '../../context/ThemeContext';

// Icons
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const PLANS = [
    {
        id: 'free',
        name: 'บัญชีทั่วไป',
        price: 'ใช้ฟรี',
        description: 'ติดตามรายรับรายจ่ายพื้นฐาน เหมาะสำหรับผู้เริ่มต้น',
        features: ['บันทึกรายการไม่จำกัด', 'กราฟรายรับรายจ่าย', 'สำรองข้อมูลในเครื่อง'],
        isCurrent: true,
    },
    {
        id: 'pro',
        name: 'บัญชีพรีเมียม',
        price: '฿ 79 / เดือน',
        description: 'สำหรับคนที่อยากเห็นภาพการเงินชัดขึ้น พร้อมฟีเจอร์วิเคราะห์ขั้นสูง',
        features: [
            'สรุปรายงานอัตโนมัติ',
            'วิเคราะห์หมวดหมู่เชิงลึก',
            'แจ้งเตือนงบประมาณล่วงหน้า',
            'ธีมพิเศษและไอคอนพรีเมียม',
        ],
        isCurrent: false,
        comingSoon: true,
    },
];

export default function UpgradeAccount() {

    const navigation = useNavigation();
    const {colors} = useTheme();

    return (
        <View style={[styles.container, {backgroundColor: colors.background}]}>
            <View style={styles.headerRow}>
                <TouchableOpacity
                    style={[styles.backBtn, {backgroundColor: colors.chart}]}
                    onPress={() => navigation.goBack()}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                    <Feather name="arrow-left" size={22} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, {color: colors.text}]}>อัปเกรดบัญชี</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={[styles.highlightBox, {backgroundColor: colors.cardBg, borderColor: colors.border}]}>
                    <MaterialCommunityIcons
                        name="crown-outline"
                        size={32}
                        color={colors.accent}
                    />
                    <Text style={[styles.highlightTitle, {color: colors.text}]}>ควบคุมการเงินแบบโปร</Text>
                    <Text style={[styles.highlightText, {color: colors.text}]}>
                        อัปเกรดเป็นบัญชีพรีเมียมเพื่อปลดล็อกฟีเจอร์วิเคราะห์เชิงลึก และการเตือนอัจฉริยะ
                    </Text>
                </View>

                {PLANS.map((plan) => (
                    <View
                        key={plan.id}
                        style={[
                            styles.planCard, {backgroundColor: colors.cardBg, borderColor: colors.border},
                            plan.id === 'pro' && {backgroundColor: colors.accent},
                        ]}
                    >
                        <View style={styles.planHeaderRow}>
                            <Text style={[styles.planName, {color: plan.id === 'pro' ? colors.background : colors.text}]}>{plan.name}</Text>
                            <Text style={[styles.planPrice, {color: colors.accent}]}>{plan.price}</Text>
                        </View>
                        <Text style={[styles.planDescription, {color: plan.id === 'pro' ? colors.chart : colors.gray}]}>{plan.description}</Text>
                        <View style={styles.featureList}>
                            {plan.features.map((f, idx) => (
                                <View key={idx} style={styles.featureRow}>
                                    <Feather
                                        name="check"
                                        size={14}
                                        color={
                                            plan.id === 'pro' ? colors.background : colors.accent
                                        }
                                    />
                                    <Text
                                        style={[
                                            {color: colors.text, fontSize: SIZES.xs},
                                            plan.id === 'pro' && {color: colors.chart},
                                        ]}
                                    >
                                        {f}
                                    </Text>
                                </View>
                            ))}
                        </View>

                        {plan.isCurrent ? (
                            <View style={[styles.currentBadge, {backgroundColor: colors.accent}]}>
                                <Text style={[styles.currentBadgeText, {color: colors.background}]}>กำลังใช้งาน</Text>
                            </View>
                        ) : (
                            <TouchableOpacity
                                style={[
                                    styles.upgradeButton, {backgroundColor: colors.background},
                                    plan.comingSoon && styles.upgradeButtonDisabled,
                                ]}
                                activeOpacity={plan.comingSoon ? 1 : 0.9}
                            >
                                <Text style={[styles.upgradeButtonText, {color: colors.text}]}>
                                    {plan.comingSoon ? 'เร็ว ๆ นี้' : 'อัปเกรดเป็นพรีเมียม'}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.black,
        paddingHorizontal: 20,
        paddingTop: 40,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.cardBg,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        color: COLORS.white,
        fontSize: SIZES.xl,
        fontWeight: FONTS.bold,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    highlightBox: {
        backgroundColor: COLORS.cardBg,
        borderRadius: 18,
        padding: 18,
        borderWidth: 1,
        borderColor: COLORS.chart,
        marginBottom: 16,
        ...CARD_SHADOW
    },
    highlightTitle: {
        color: COLORS.white,
        fontSize: SIZES.base,
        fontWeight: FONTS.bold,
        marginTop: 10,
        marginBottom: 4,
    },
    highlightText: {
        color: COLORS.background_White,
        fontSize: SIZES.sm,
        lineHeight: 20,
    },
    planCard: {
        borderRadius: 18,
        padding: 18,
        marginTop: 12,
        borderWidth: 1,
        ...CARD_SHADOW
    },
    planHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    planName: {
        color: COLORS.white,
        fontSize: SIZES.base,
        fontWeight: FONTS.bold,
    },
    planPrice: {
        color: COLORS.accent,
        fontSize: SIZES.sm,
        fontWeight: FONTS.bold,
    },
    planDescription: {
        color: COLORS.gray,
        fontSize: SIZES.sm,
        fontWeight: FONTS.bold,
        marginBottom: 10,
    },
    featureList: {
        marginBottom: 14,
        gap: 6,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    currentBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
        opacity: 0.7,
    },
    currentBadgeText: {
        color: COLORS.background_White,
        fontSize: SIZES.xs,
        fontWeight: FONTS.semibold,
    },
    upgradeButton: {
        marginTop: 4,
        borderRadius: 999,
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    upgradeButtonText: {
        fontSize: SIZES.sm,
        fontWeight: FONTS.bold,
    },
    upgradeButtonDisabled: {
        opacity: 0.9,
    },
});

