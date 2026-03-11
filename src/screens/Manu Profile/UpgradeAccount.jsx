import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SIZES, FONTS } from '../../style/Theme';
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

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => navigation.goBack()}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                    <Feather name="arrow-left" size={22} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>อัปเกรดบัญชี</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.highlightBox}>
                    <MaterialCommunityIcons
                        name="crown-outline"
                        size={32}
                        color={COLORS.accent}
                    />
                    <Text style={styles.highlightTitle}>ควบคุมการเงินแบบโปร</Text>
                    <Text style={styles.highlightText}>
                        อัปเกรดเป็นบัญชีพรีเมียมเพื่อปลดล็อกฟีเจอร์วิเคราะห์เชิงลึก และการเตือนอัจฉริยะ
                    </Text>
                </View>

                {PLANS.map((plan) => (
                    <View
                        key={plan.id}
                        style={[
                            styles.planCard,
                            plan.id === 'pro' && styles.planCardPro,
                        ]}
                    >
                        <View style={styles.planHeaderRow}>
                            <Text style={styles.planName}>{plan.name}</Text>
                            <Text style={styles.planPrice}>{plan.price}</Text>
                        </View>
                        <Text style={styles.planDescription}>{plan.description}</Text>
                        <View style={styles.featureList}>
                            {plan.features.map((f, idx) => (
                                <View key={idx} style={styles.featureRow}>
                                    <Feather
                                        name="check"
                                        size={14}
                                        color={
                                            plan.id === 'pro' ? COLORS.black : COLORS.accent
                                        }
                                    />
                                    <Text
                                        style={[
                                            styles.featureText,
                                            plan.id === 'pro' && styles.featureTextPro,
                                        ]}
                                    >
                                        {f}
                                    </Text>
                                </View>
                            ))}
                        </View>

                        {plan.isCurrent ? (
                            <View style={styles.currentBadge}>
                                <Text style={styles.currentBadgeText}>กำลังใช้งาน</Text>
                            </View>
                        ) : (
                            <TouchableOpacity
                                style={[
                                    styles.upgradeButton,
                                    plan.comingSoon && styles.upgradeButtonDisabled,
                                ]}
                                activeOpacity={plan.comingSoon ? 1 : 0.9}
                            >
                                <Text style={styles.upgradeButtonText}>
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
        backgroundColor: COLORS.cardBg,
        borderRadius: 18,
        padding: 18,
        marginTop: 12,
        borderWidth: 1,
        borderColor: COLORS.chart,
    },
    planCardPro: {
        backgroundColor: COLORS.accent,
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
    featureText: {
        color: COLORS.background_White,
        fontSize: SIZES.xs,
    },
    featureTextPro: {
        color: COLORS.black,
    },
    currentBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: COLORS.chart,
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
        backgroundColor: COLORS.black,
    },
    upgradeButtonDisabled: {
        opacity: 0.7,
    },
    upgradeButtonText: {
        color: COLORS.white,
        fontSize: SIZES.sm,
        fontWeight: FONTS.bold,
    },
});

