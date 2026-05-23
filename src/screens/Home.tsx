import React, { useState, useMemo, useEffect, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Modal,
    Image,
    Linking,
    Animated,
} from "react-native";
import { BlurView } from 'expo-blur';
import { horizontalScale, verticalScale, moderateScale } from '../utils/responsive';

// ---Theme & Components ---
import { SIZES, FONTS, CARD_SHADOW, COLORS } from '../style/Theme';
import { useTheme } from '../context/ThemeContext';
import { usePopup } from '../context/PopupContext';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import { useCategory } from '../context/CategoryContext';
import { useTransaction } from '../context/TransactionContext';
import Nav from '../components/Nav';
import { getIconComponent } from '../utils/categoryIcons';
import Footer from '../components/Footer';
import PieChartComponent from '../components/pieChart';
import PieChartGroup from '../components/pieChartGroup';
import ScreenLoader from '../components/ScreenLoader';

// ---Icons ---
import {
    Mail,
    Github,
    Heart,
    Archive,
    Landmark,
    Banknote,
    X,
    Settings
} from 'lucide-react-native';

// ---Hooks ---
import { useTransactionStats } from '../hooks/useTransactionStats';

/**
 * Home Screen Component
 * The main dashboard displaying high-level transaction statistics, 
 * category balances, and providing access to navigation and popups.
 */
export default function Home() {
    // ---Context Hooks ---
    const { colors } = useTheme();
    const { isOpen, closePopup } = usePopup();
    const { t, formatMonthYear } = useLanguage();
    const { formatMoney } = useCurrency();
    const { isLoading } = useTransaction();

    // ---Local State ---
    const [popupMoney, setPopupMoney] = useState<boolean | null>(null); // Toggles general income/expense popup
    const [popupGroup, setPopupGroup] = useState<string | null>(null); // Stores the active category ID for group popup

    // ---Category & Stats Hooks ---
    const {
        getCategoryDisplayName,
        CATEGORY_IDS,
        getCategoryIconName,
        getCategoryGoal,
        isSaving: isCategorySaving,
    } = useCategory();
    const { allTimeStats, monthlyStats } = useTransactionStats();

    // ---Helpers & Computations ---
    const fmt = (n: number) => formatMoney(n);

    // URL contacts in about section
    const GITHUB_URL = 'https://github.com/indiv-it/FakeWalletHub';
    const CONTACT_EMAIL = 'indiv.company@gmail.com';

    /**
     * Prepare display categories mapping IDs to their display data
     */
    const displayCategories = useMemo(() => CATEGORY_IDS.map((catId) => {
        const iconName = getCategoryIconName(catId);
        return {
            id: catId,
            name: getCategoryDisplayName(catId),
            icon: getIconComponent(iconName, 18, colors.background) || <Settings size={18} color={colors.background} />,
        };
    }), [CATEGORY_IDS, getCategoryDisplayName, getCategoryIconName, colors.background]);

    const categoryBalances = useMemo(() => {
        const map: Record<string, number> = {};
        for (const catId of CATEGORY_IDS) {
            const stat = allTimeStats.categoryStats[catId];
            map[catId] = (stat?.income ?? 0) - (stat?.expense ?? 0);
        }
        return map;
    }, [allTimeStats.categoryStats, CATEGORY_IDS]);

    // ---Sub-Components ---

    /**
     * Renders a category card in the list showing balance and a miniature pie chart
     */
    const CategoryCard = ({ catId, icon }: { catId: string; icon: React.ReactNode }) => {
        const displayName = getCategoryDisplayName(catId);
        const balance = categoryBalances[catId] ?? 0;
        const isLast = catId === CATEGORY_IDS[CATEGORY_IDS.length - 1];

        // Savings Goal
        const goal = getCategoryGoal(catId);
        const hasGoal = goal && goal.goal_enabled;

        // Setup Progress Bar Animation if Goal is Enabled
        const progressAnim = useRef(new Animated.Value(0)).current;
        const progressPercentage = hasGoal && goal.goal_amount > 0 ? Math.min(Math.max((balance / goal.goal_amount) * 100, 0), 100) : 0;

        useEffect(() => {
            if (hasGoal) {
                Animated.timing(progressAnim, {
                    toValue: progressPercentage,
                    duration: 1000,
                    useNativeDriver: false,
                }).start();
            }
        }, [progressPercentage, hasGoal]);

        const progressWidth = progressAnim.interpolate({
            inputRange: [0, 100],
            outputRange: ['0%', '100%'],
        });

        return (
            <TouchableOpacity
                onPress={() => setPopupGroup(catId)}
                style={[styles.list, {
                    borderBottomColor: colors.border,
                    borderBottomWidth: isLast ? 0 : 1,
                    alignItems: 'center',
                }]}
            >
                {/* Icon Wrapper */}
                <View style={[styles.cardIcon, { backgroundColor: colors.accent }]}>
                    {icon}
                </View>

                {/* Category Name, Balance, and Optional Progress Bar */}
                <View style={{ flex: 1, marginRight: hasGoal ? 0 : 10 }}>
                    <Text style={{ color: colors.text, fontSize: SIZES.sm, fontWeight: FONTS.normal }}>
                        {displayName}
                    </Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <Text style={{ color: colors.accent, fontSize: SIZES.base, fontWeight: FONTS.bold }}>
                            {fmt(balance)}
                        </Text>
                        {hasGoal && (
                            <Text style={{ color: colors.gray, fontSize: 10 }}>
                                {fmt(goal.goal_amount)}
                            </Text>
                        )}
                    </View>

                    {hasGoal && (
                        <View style={{ height: 6, backgroundColor: colors.border, borderRadius: 3, overflow: 'hidden', marginTop: 5 }}>
                            <Animated.View style={{ height: '100%', width: progressWidth, backgroundColor: colors.accent }} />
                        </View>
                    )}
                </View>

                {/* Miniature Pie Chart for Income vs Expense if no goal */}
                {!hasGoal && (
                    <View style={{ width: 60, alignItems: "flex-end" }}>
                        <PieChartComponent
                            income={allTimeStats.categoryStats[catId]?.income || 0}
                            expense={allTimeStats.categoryStats[catId]?.expense || 0}
                            size={60}
                            color={colors.red}
                            background={colors.accent}
                        />
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    /**
     * Popup displaying detailed monthly statistics for a specific category
     */
    const GroupPopup = ({ catId }: { catId: string }) => {
        const displayName = getCategoryDisplayName(catId);
        const monthlyCat = monthlyStats.categoryStats[catId];
        const monthlyIncome = monthlyCat?.income ?? 0;
        const monthlyExpense = monthlyCat?.expense ?? 0;
        const monthlyPercentBase = Math.max(monthlyIncome, monthlyExpense);
        const monthlyIncomePercent = monthlyPercentBase > 0 ? (monthlyIncome / monthlyPercentBase) * 100 : 0;
        const monthlyExpensePercent = monthlyPercentBase > 0 ? (monthlyExpense / monthlyPercentBase) * 100 : 0;
        const totalShare = allTimeStats.categoryPercent[catId] ?? 0;
        const pieShare = Math.min(Math.max(totalShare, 0), 100);

        return (
            <View style={[styles.popupMoney, { backgroundColor: colors.cardBg }]}>
                <X
                    onPress={() => setPopupGroup(null)}
                    size={24}
                    color={colors.text}
                    style={{
                        position: "absolute",
                        right: 15,
                        top: 15,
                        zIndex: 100
                    }}
                />

                <Text style={{ color: colors.accent, fontSize: SIZES.xl, fontWeight: FONTS.bold }}>
                    {displayName}
                </Text>

                <Text style={{ color: colors.text, marginTop: 10, marginBottom: 20, fontSize: SIZES.xs, fontWeight: FONTS.normal }}>
                    {t('monthlyData')} : {formatMonthYear()}
                </Text>

                <ChartIncomeExpense
                    title={t('income')}
                    money={monthlyIncome}
                    color='white'
                    income={monthlyIncome}
                    expense={monthlyExpense}
                    percent={monthlyIncomePercent.toFixed(1)}
                    background={colors.accent}
                />

                <ChartIncomeExpense
                    title={t('expense')}
                    money={monthlyExpense}
                    color='white'
                    income={monthlyExpense}
                    expense={monthlyIncome}
                    percent={monthlyExpensePercent.toFixed(1)}
                    background={colors.red}
                />

                <View style={[styles.pieChartContainer, { borderLeftColor: colors.text }]}>
                    <View>
                        <Text style={{ color: colors.text, fontSize: 16, fontWeight: 'bold' }}>
                            {t('totalRatio')}
                        </Text>
                        <Text style={{ color: colors.gray, fontSize: 12, marginBottom: 4 }}>
                            {t('allTimeData')}
                        </Text>
                        <Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold' }}>
                            {totalShare.toFixed(1)}%
                        </Text>
                    </View>

                    <PieChartComponent
                        income={pieShare}
                        expense={100 - pieShare}
                        size={80}
                        color='white'
                        background={colors.text}
                    />
                </View>
            </View>
        );
    };

    /**
     * Reusable row component for displaying a specific chart alongside its stats
     */
    interface ChartIncomeExpenseProps {
        title: string;
        money: number;
        color: string;
        income: number;
        expense: number;
        percent: string;
        background: string;
    }

    const ChartIncomeExpense = ({ title, money, color, income, expense, percent, background }: ChartIncomeExpenseProps) => {
        return (
            <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 20
            }}>
                {/* title and money */}
                <View style={{
                    borderLeftWidth: 3,
                    paddingLeft: 10,
                    borderLeftColor: title === t('income')
                        ? colors.accent
                        : colors.red
                }}>

                    {/* Title */}
                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: title === t('income') ? colors.accent : colors.red }}>
                        {title}
                    </Text>

                    {/* Money */}
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: title === t('income') ? colors.accent : colors.red }}>
                        {fmt(money)}
                    </Text>

                    {/* Percent */}
                    <Text style={{ color: colors.gray, fontSize: 14 }}>
                        {percent}%
                    </Text>
                </View>

                {/* pie chart */}
                <PieChartComponent
                    income={income}
                    expense={expense}
                    size={80}
                    color={color}
                    background={background}
                />
            </View>
        );
    };

    // ---Main Rendering ---
    return (
        <View style={{
            backgroundColor: colors.background,
            padding: horizontalScale(20),
            flex: 1
        }}>
            {/* Loading Spinner */}
            <ScreenLoader visible={isLoading || isCategorySaving} />

            {/* Top Navigation Component */}
            <Nav />

            {/* Top Stat Summary Card */}
            <View style={[styles.card, {
                backgroundColor: colors.cardBg,
                borderColor: colors.border
            }]}>
                <View>
                    {/* Bank */}
                    <View style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 10
                    }}>
                        <Landmark size={14} color={colors.text} />
                        <Text style={{ color: colors.text, fontSize: SIZES.sm, fontWeight: FONTS.normal }}>
                            {fmt(allTimeStats.bank)}
                        </Text>
                    </View>

                    {/* Cash */}
                    <View style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 10
                    }}>
                        <Banknote size={14} color={colors.text} />
                        <Text style={{ color: colors.text, fontSize: SIZES.sm, fontWeight: FONTS.normal }}>
                            {fmt(allTimeStats.cash)}
                        </Text>
                    </View>

                    {/* net profit */}
                    <View style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 10
                    }}>
                        <Archive size={14} color={colors.text} />
                        <Text style={{ color: colors.text, fontSize: SIZES.sm, fontWeight: FONTS.normal }}>
                            {fmt(allTimeStats.netProfit)}
                        </Text>
                    </View>

                    {/* total balance */}
                    <Text style={{ color: colors.accent, fontSize: SIZES.xl, fontWeight: FONTS.bold }}>
                        {fmt(allTimeStats.balance)}
                    </Text>
                </View>

                {/* pie chart income/expense */}
                <PieChartComponent
                    income={allTimeStats.totalIncome}
                    expense={allTimeStats.totalExpense}
                    size={100}
                    color={colors.red}
                    onPieClick={() => setPopupMoney(true)}
                    background={colors.accent}
                />
            </View>

            {/* list group */}
            <View style={[styles.cardList, {
                backgroundColor: colors.cardBg,
                borderColor: colors.border
            }]}>
                <FlatList
                    data={displayCategories}
                    scrollEnabled={false}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <CategoryCard
                            catId={item.id}
                            icon={item.icon}
                        />
                    )}
                />
            </View>

            {/* Footer */}
            <Footer />

            {/* popup expense & income */}
            {popupMoney && (
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={!!popupMoney}
                    onRequestClose={() => setPopupMoney(null)}
                >
                    <BlurView
                        intensity={5}
                        tint="dark"
                        style={styles.popupContainer}
                    >

                        {/* Overlay */}
                        <TouchableOpacity
                            style={styles.popupShadow}
                            activeOpacity={1}
                            onPress={() => setPopupMoney(null)}
                        >
                            <View style={[styles.popupMoney, { backgroundColor: colors.cardBg }]}>

                                {/* close button */}
                                <X
                                    onPress={() => setPopupMoney(null)}
                                    color={colors.text}
                                    size={24}
                                    style={{
                                        position: "absolute",
                                        right: 15,
                                        top: 15,
                                        zIndex: 100
                                    }}
                                />

                                <View>
                                    <Text style={{ color: colors.accent, marginBottom: 5, fontSize: SIZES.sm, fontWeight: FONTS.bold }}>
                                        {t('moneySumText')}
                                    </Text>

                                    {/* month year */}
                                    <Text style={{ color: colors.text, marginBottom: 20, fontSize: SIZES.xs, fontWeight: FONTS.normal }}>
                                        {t('monthlyData')} : {formatMonthYear()}
                                    </Text>

                                    {/* income chart */}
                                    <ChartIncomeExpense
                                        title={t('income')}
                                        money={monthlyStats.totalIncome || 0}
                                        color='white'
                                        income={monthlyStats.totalIncome || 0}
                                        expense={monthlyStats.totalExpense || 0}
                                        percent={monthlyStats.incomePercent.toFixed(1)}
                                        background={colors.accent}
                                    />

                                    {/* expense chart */}
                                    <ChartIncomeExpense
                                        title={t('expense')}
                                        money={monthlyStats.totalExpense || 0}
                                        color='white'
                                        income={monthlyStats.totalExpense || 0}
                                        expense={monthlyStats.totalIncome || 0}
                                        percent={monthlyStats.expensePercent.toFixed(1)}
                                        background={colors.red}
                                    />

                                    <Text style={{ color: colors.text, marginTop: 20, textAlign: 'center', fontWeight: 'bold' }}>
                                        {t('expenseByCat')}
                                    </Text>

                                    {/* pie chart group - monthly category expense share */}
                                    <PieChartGroup
                                        data={monthlyStats.expenseByCategory || []}
                                        expense={monthlyStats.expenseByCategoryPercent.map(i => i.percent.toFixed(1))}
                                    />
                                </View>
                            </View>
                        </TouchableOpacity>
                    </BlurView>
                </Modal>
            )}

            {/* popup Group */}
            {popupGroup && (
                <Modal
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setPopupGroup(null)}
                >
                    <BlurView
                        intensity={5}
                        tint="dark"
                        style={styles.popupContainer}
                    >
                        <TouchableOpacity
                            style={styles.popupShadow}
                            activeOpacity={1}
                            onPress={() => setPopupGroup(null)}
                        >
                            <GroupPopup catId={popupGroup} />
                        </TouchableOpacity>
                    </BlurView>
                </Modal>
            )}

            {/* popup About */}
            <Modal
                visible={isOpen}
                transparent
                animationType="fade"
                onRequestClose={closePopup}
            >
                <BlurView
                    intensity={5}
                    tint="dark"
                    style={styles.popupContainer}
                >
                    <View style={dialogStyles.overlay}>
                        {/* Overlay */}
                        <TouchableOpacity
                            style={[StyleSheet.absoluteFillObject]}
                            activeOpacity={1}
                            onPress={closePopup}
                        />
                        <View style={[dialogStyles.card, {
                            backgroundColor: colors.cardBg,
                            borderColor: colors.border
                        }]}>

                            {/* close button */}
                            <X
                                onPress={closePopup}
                                size={24}
                                color={colors.text}
                                style={{
                                    position: "absolute",
                                    right: 15,
                                    top: 15,
                                    zIndex: 100
                                }}
                            />
                            <View style={{
                                alignItems: 'center',
                                marginBottom: verticalScale(16)
                            }}>

                                {/* Logo */}
                                <Image
                                    source={require('../imgs/Logo_FWH.png')}
                                    style={dialogStyles.aboutLogo}
                                />

                                {/* Title */}
                                <Text style={[dialogStyles.title, { color: colors.text }]}>
                                    FakeWalletHub
                                </Text>

                                {/* Version */}
                                <View style={[dialogStyles.versionTag, { backgroundColor: colors.accent + '35' }]}>
                                    <Text style={{ color: colors.accent, fontSize: 12, fontWeight: 'bold' }}>
                                        v1.3.0
                                    </Text>
                                </View>
                            </View>

                            <View style={{ marginTop: verticalScale(10) }}>
                                {/* Description */}
                                <Text style={[dialogStyles.aboutDesc, { color: colors.text }]}>
                                    {t('aboutDescFull')}
                                </Text>

                                {/* Divider */}
                                <View style={[dialogStyles.divider, { backgroundColor: colors.text + '50' }]} />

                                {/* info rows -Developer */}
                                <View style={dialogStyles.infoRow}>
                                    <Text style={{ color: colors.gray, fontSize: moderateScale(13) }}>
                                        {t('developer')}
                                    </Text>
                                    <Text style={[dialogStyles.infoValue, { color: colors.text }]}>
                                        Chockpipat Kongdee
                                    </Text>
                                </View>

                                {/* info rows -License */}
                                <View style={dialogStyles.infoRow}>
                                    <Text style={{ color: colors.gray, fontSize: moderateScale(13) }}>
                                        {t('license')}
                                    </Text>
                                    <Text style={[dialogStyles.infoValue, { color: colors.text }]}>
                                        MIT License
                                    </Text>
                                </View>

                                {/* Divider */}
                                <View style={[dialogStyles.divider, { backgroundColor: colors.text + '50' }]} />

                                {/* Links */}
                                <View style={dialogStyles.linksContainer}>
                                    {/* Git hub */}
                                    <TouchableOpacity
                                        style={dialogStyles.linkItem}
                                        onPress={() => Linking.openURL(GITHUB_URL)}
                                    >
                                        <Github size={20} color={colors.accent} />
                                        <Text style={{ color: colors.accent, marginLeft: 8 }}>
                                            GitHub
                                        </Text>
                                    </TouchableOpacity>

                                    {/* Contact Email */}
                                    <TouchableOpacity
                                        style={dialogStyles.linkItem}
                                        onPress={() => Linking.openURL(`mailto:${CONTACT_EMAIL}`)}
                                    >
                                        <Mail size={20} color={colors.accent} />
                                        <Text style={{ color: colors.accent, marginLeft: 8 }}>
                                            Contact
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Footer */}
                                <View style={dialogStyles.footer}>
                                    <View style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        marginTop: 4
                                    }}>
                                        <Text style={{ color: colors.gray, fontSize: 11 }}>
                                            Made with &nbsp;
                                        </Text>
                                        <Heart size={10} color={colors.red} fill={colors.red} />
                                        <Text style={{ color: colors.gray, fontSize: 11 }}>
                                            &nbsp; in Thailand
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            {/* close button */}
                            <TouchableOpacity
                                style={[dialogStyles.primaryButton, { backgroundColor: colors.accent }]}
                                onPress={closePopup}
                                activeOpacity={0.9}
                            >
                                <Text style={[dialogStyles.primaryButtonText, { color: colors.background }]}>
                                    {t('close')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </BlurView>
            </Modal>
        </View>
    );
}

// ---Styles ---
const styles = StyleSheet.create({
    card: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderRadius: moderateScale(10),
        height: verticalScale(150),
        padding: horizontalScale(20),
        marginBottom: verticalScale(15),
        borderWidth: 1,
        ...CARD_SHADOW
    },
    list: {
        flexDirection: "row",
        paddingVertical: verticalScale(15),
    },
    cardList: {
        borderRadius: moderateScale(10),
        padding: horizontalScale(10),
        overflow: "hidden",
        paddingHorizontal: horizontalScale(20),
        borderWidth: 1,
        ...CARD_SHADOW
    },
    cardIcon: {
        alignItems: "center",
        justifyContent: "center",
        width: horizontalScale(70),
        height: verticalScale(50),
        borderRadius: moderateScale(10),
        marginRight: horizontalScale(10),
    },
    popupContainer: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    popupShadow: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.8)",
    },
    popupMoney: {
        width: horizontalScale(300),
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: [{ translateX: -horizontalScale(150) }, { translateY: -verticalScale(220) }],
        borderRadius: moderateScale(10),
        padding: horizontalScale(20),
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    pieChartContainer: {
        borderLeftWidth: 3,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: 'center',
        paddingLeft: 10,
        marginVertical: 20
    },
});

const dialogStyles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "rgba(0,0,0,0.3)",
    },
    card: {
        width: '85%',
        borderRadius: moderateScale(24),
        paddingVertical: verticalScale(24),
        paddingHorizontal: horizontalScale(20),
        borderWidth: 1,
        ...CARD_SHADOW,
    },
    aboutLogo: {
        width: horizontalScale(60),
        height: horizontalScale(60),
        marginBottom: verticalScale(12),
        backgroundColor: COLORS.black,
        borderRadius: 10,
    },
    title: {
        fontSize: moderateScale(20),
        fontWeight: FONTS.bold,
        marginBottom: verticalScale(4),
    },
    versionTag: {
        paddingHorizontal: horizontalScale(10),
        paddingVertical: verticalScale(2),
        borderRadius: moderateScale(20),
    },
    aboutDesc: {
        fontSize: moderateScale(13),
        textAlign: 'center',
        lineHeight: moderateScale(20),
        marginBottom: verticalScale(20),
    },
    divider: {
        height: 1,
        marginVertical: verticalScale(12),
        opacity: 0.5,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: verticalScale(8),
    },
    infoValue: {
        fontSize: moderateScale(13),
        fontWeight: 'bold',
    },
    linksContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginVertical: verticalScale(12),
    },
    linkItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    footer: {
        alignItems: 'center',
        marginTop: verticalScale(16),
        marginBottom: verticalScale(20),
    },
    primaryButton: {
        borderRadius: moderateScale(12),
        paddingVertical: verticalScale(12),
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    primaryButtonText: {
        fontSize: moderateScale(15),
        fontWeight: FONTS.bold,
    },
});
