import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Modal,
    Image,
    Linking,
} from "react-native"
import { useState, useMemo } from "react";
import { BlurView } from 'expo-blur';
import { horizontalScale, verticalScale, moderateScale } from '../utils/responsive';

// --- Theme & Components ---
import { SIZES, FONTS, CARD_SHADOW, COLORS } from '../style/Theme';
import { useTheme } from '../context/ThemeContext';
import { usePopup } from '../context/PopupContext';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import { useCategory } from '../context/CategoryContext';
import Nav, { getIconComponent } from '../components/Nav';
import Footer from '../components/Footer';
import PieChartComponent from '../components/pieChart';
import PieChartGroup from '../components/pieChartGroup';

// --- Icons ---
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

// --- Hooks ---
import { useTransactionStats } from '../hooks/useTransactionStats';

/**
 * Home Screen Component
 * The main dashboard displaying high-level transaction statistics, 
 * category balances, and providing access to navigation and popups.
 */
export default function Home() {
    // --- Context Hooks ---
    const { colors } = useTheme(); 
    const { isOpen, closePopup } = usePopup(); 
    const { t, formatMonthYear } = useLanguage(); 
    const { formatMoney } = useCurrency(); 

    // --- Local State ---
    const [popupMoney, setPopupMoney] = useState(null); // Toggles general income/expense popup
    const [popupGroup, setPopupGroup] = useState(null); // Stores the active category ID for group popup

    // --- Category & Stats Hooks ---
    const { getCategoryDisplayName, CATEGORY_IDS, getCategoryIconName } = useCategory();
    const { allTimeStats, monthlyStats } = useTransactionStats();

    // --- Helpers & Computations ---
    const fmt = (n) => formatMoney(n);

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

    /**
     * Calculate category balance (income - expense)
     */
    const getCategoryBalance = (stats, catId) => {
        const income = stats?.[catId]?.income || 0;
        const expense = stats?.[catId]?.expense || 0;
        return income - expense;
    };

    // --- Sub-Components ---

    /**
     * Renders a category card in the list showing balance and a miniature pie chart
     */
    const CategoryCard = ({ catId, icon }) => {
        const displayName = getCategoryDisplayName(catId);
        const balance = getCategoryBalance(allTimeStats.categoryStats, catId);
        const isLast = catId === CATEGORY_IDS[CATEGORY_IDS.length - 1];
        return (
            <TouchableOpacity
                onPress={() => setPopupGroup(catId)}
                style={[styles.list, {
                    borderBottomColor: colors.border,
                    borderBottomWidth: isLast ? 0 : 1
                }]}
            >
                {/* Icon Wrapper */}
                <View style={[styles.cardIcon, { backgroundColor: colors.accent }]}>
                    {icon}
                </View>

                {/* Category Name and Balance */}
                <View>
                    <Text style={{ color: colors.text, fontSize: SIZES.sm, fontWeight: FONTS.normal }}>
                        {displayName}
                    </Text>
                    <Text style={{ color: colors.accent, fontSize: SIZES.base, fontWeight: FONTS.bold }}>
                        {fmt(balance)}
                    </Text>
                </View>

                {/* Miniature Pie Chart for Income vs Expense */}
                <View style={{ flex: 1, alignItems: "flex-end" }}>
                    <PieChartComponent
                        income={allTimeStats.categoryStats[catId]?.income || 0}
                        expense={allTimeStats.categoryStats[catId]?.expense || 0}
                        size={60}
                        color={colors.red}
                        background={colors.accent}
                    />
                </View>
            </TouchableOpacity>
        );
    };

    /**
     * Popup displaying detailed monthly statistics for a specific category
     */
    const GroupPopup = ({ catId }) => {
        const displayName = getCategoryDisplayName(catId);
        return (
            <View style={[styles.popupMoney, { backgroundColor: colors.cardBg }]}>
                {/* close button */}
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

                {/* category name */}
                <Text style={{ color: colors.accent, fontSize: SIZES.xl, fontWeight: FONTS.bold }}>
                    {displayName}
                </Text>

                {/* month year */}
                <Text style={{ color: colors.text, marginTop: 10, marginBottom: 20, fontSize: SIZES.xs, fontWeight: FONTS.normal }}>
                    {t('monthlyData')} : {formatMonthYear()}
                </Text>

                {/* income chart */}
                <ChartIncomeExpense
                    title={t('income')}
                    money={monthlyStats.categoryStats[catId]?.income || 0}
                    color='white'
                    income={monthlyStats.categoryStats[catId]?.income || 0}
                    expense={monthlyStats.categoryStats[catId]?.expense || 0}
                    percent={monthlyStats.categoryStatsPercent[catId]?.incomePercent.toFixed(1) || 0}
                    background={colors.accent}
                />

                {/* expense chart */}
                <ChartIncomeExpense
                    title={t('expense')}
                    money={monthlyStats.categoryStats[catId]?.expense || 0}
                    color='white'
                    income={monthlyStats.categoryStats[catId]?.expense || 0}
                    expense={monthlyStats.categoryStats[catId]?.income || 0}
                    percent={monthlyStats.categoryStatsPercent[catId]?.expensePercent.toFixed(1) || 0}
                    background={colors.red}
                />

                <View style={[styles.pieChartContainer, { borderLeftColor: colors.text }]}>
                    {/* total ratio text */}
                    <View>
                        <Text style={{ color: colors.text, fontSize: 16, fontWeight: 'bold' }}>
                            {t('totalRatio')}
                        </Text>
                        <Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold' }}>
                            {monthlyStats.categoryPercent[catId]?.toFixed(1) || 0}%
                        </Text>
                    </View>

                    {/* Overall Ratio Pie Chart */}
                    <PieChartComponent
                        income={monthlyStats.categoryPercent[catId] || 0}
                        expense={100 - (monthlyStats.categoryPercent[catId] || 0)}
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
    const ChartIncomeExpense = ({ title, money, color, income, expense, percent, background }) => {
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

                    {/* title */}
                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: title === t('income') ? colors.accent : colors.red }}>
                        {title}
                    </Text>

                    {/* money */}
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: title === t('income') ? colors.accent : colors.red }}>
                        {fmt(money)}
                    </Text>

                    {/* percent */}
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

    // --- Main Rendering ---
    return (
        <View style={{ 
            backgroundColor: colors.background, 
            padding: horizontalScale(20),
            flex: 1
        }}>
            {/* Top Navigation Component */}
            <Nav />

            {/* Top Stat Summary Card */}
            <View style={[styles.card, { 
                backgroundColor: colors.cardBg, 
                borderColor: colors.border 
            }]}>
                <View>
                    {/* bank */}
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

                    {/* cash */}
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

            {/* footer */}
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

                        {/* overlay */}
                        <TouchableOpacity
                            style={styles.popupShadow}
                            activeOpacity={1}
                            onPress={() => setPopupMoney(null)}
                        >
                            <View style={[styles.popupMoney, { 
                                backgroundColor: colors.cardBg, 
                                transform: [
                                    { translateX: -horizontalScale(150) }, 
                                    { translateY: -verticalScale(280) } 
                                ] 
                            }]}>

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

                                    {/* expense text by category */}
                                    <Text style={{ color: colors.text,marginBottom: 10,marginTop: 20,textAlign: 'center',fontWeight: 'bold' }}>
                                        {t('expenseByCat')}
                                    </Text>

                                    {/* pie chart group */}
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
                        {/* overlay */}
                        <TouchableOpacity
                            style={[styles.popupShadow, StyleSheet.absoluteFillObject]}
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

                                {/* logo */}
                                <Image 
                                    source={require('../imgs/Logo_FWH.png')} 
                                    style={dialogStyles.aboutLogo} 
                                />

                                {/* title */}
                                <Text style={[dialogStyles.title, { color: colors.text }]}>
                                    FakeWalletHub
                                </Text>

                                {/* version */}
                                <View style={[dialogStyles.versionTag, { backgroundColor: colors.accent + '35' }]}>
                                    <Text style={{ color: colors.accent, fontSize: 12, fontWeight: 'bold' }}>
                                        v1.0.2
                                    </Text>
                                </View>
                            </View>

                            <View style={{ marginTop: verticalScale(10) }}>
                                {/* description */}
                                <Text style={[dialogStyles.aboutDesc, { color: colors.text }]}>
                                    {t('aboutDescFull')}
                                </Text>

                                {/* divider */}
                                <View style={[dialogStyles.divider, { backgroundColor: colors.text + '50' }]} />

                                {/* info rows - Developer */}
                                <View style={dialogStyles.infoRow}>
                                    <Text style={{ color: colors.gray, fontSize: moderateScale(13) }}>
                                        {t('developer')}
                                    </Text>
                                    <Text style={[dialogStyles.infoValue, { color: colors.text }]}>
                                        Chockpipat Kongdee
                                    </Text>
                                </View>

                                {/* info rows - License */}
                                <View style={dialogStyles.infoRow}>
                                    <Text style={{ color: colors.gray, fontSize: moderateScale(13) }}>
                                        {t('license')}
                                    </Text>
                                    <Text style={[dialogStyles.infoValue, { color: colors.text }]}>
                                        MIT License
                                    </Text>
                                </View>

                                {/* divider */}
                                <View style={[dialogStyles.divider, { backgroundColor: colors.text + '50' }]} />

                                {/* links */}
                                <View style={dialogStyles.linksContainer}>
                                    {/* GitHub */}
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

                                {/* footer */}
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

// --- Styles ---
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
        alignItems: "center",
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