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

// components
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
import { Mail, Github, Heart, Archive, Landmark, Banknote, X, Settings } from 'lucide-react-native';

// hooks
import { useTransactionStats } from '../hooks/useTransactionStats';

export default function Home() {
    const { colors } = useTheme();
    const { t, formatMonthYear } = useLanguage();
    const { formatMoney } = useCurrency();
    const { getCategoryDisplayName, CATEGORY_IDS, getCategoryIconName } = useCategory();
    const [popupMoney, setPopupMoney] = useState(null);
    const [popupGroup, setPopupGroup] = useState(null); // stores category ID
    const { isOpen, closePopup } = usePopup();

    const { allTimeStats, monthlyStats } = useTransactionStats();

    const fmt = (n) => formatMoney(n);

    const GITHUB_URL = 'https://github.com/indiv-it/FakeWalletHub';
    const CONTACT_EMAIL = 'indiv.company@gmail.com';

    const displayCategories = useMemo(() => CATEGORY_IDS.map((catId) => {
        const iconName = getCategoryIconName(catId);
        return {
            id: catId,
            name: getCategoryDisplayName(catId),
            icon: getIconComponent(iconName, 18, colors.background) || <Settings size={18} color={colors.background} />,
        };
    }), [CATEGORY_IDS, getCategoryDisplayName, getCategoryIconName, colors.background]);

    // Render a card for each category
    const CategoryCard = ({ catId, icon }) => {
        const displayName = getCategoryDisplayName(catId);
        const isLast = catId === CATEGORY_IDS[CATEGORY_IDS.length - 1];
        return (
            <TouchableOpacity
                style={[styles.list, { borderBottomColor: colors.border, borderBottomWidth: isLast ? 0 : 1 }]}
                onPress={() => setPopupGroup(catId)}
            >
                <View style={[styles.cardIcon, { backgroundColor: colors.accent }]}>
                    {icon}
                </View>

                <View>
                    <Text style={[styles.cardText, { color: colors.text }]}>{displayName}</Text>
                    <Text style={[styles.cardTextMoney, { color: colors.accent }]}>{fmt((allTimeStats.categoryStats[catId]?.income || 0) - (allTimeStats.categoryStats[catId]?.expense || 0))}</Text>
                </View>

                <View style={styles.cardPie}>
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


    // Category detail popup
    const GroupPopup = ({ catId }) => {
        const displayName = getCategoryDisplayName(catId);
        return (
            <View style={[styles.popupMoney, { backgroundColor: colors.cardBg }]}>
                <X
                    onPress={() => setPopupGroup(null)}
                    size={24}
                    color={colors.text}
                    style={{ position: "absolute", right: 15, top: 15, zIndex: 100 }}
                />

                <View style={{ flex: 1, justifyContent: "center", marginTop: 20 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                        <Text style={[styles.textHeader, { color: colors.accent }]}>{displayName}</Text>
                    </View>
                </View>

                <Text style={[styles.textSmInPopup, { color: colors.text, marginVertical: 20 }]}>{t('monthlyData')} : {formatMonthYear()}</Text>
                <ChartIncomeExpense
                    title={t('income')}
                    money={monthlyStats.categoryStats[catId]?.income || 0}
                    color='white'
                    income={monthlyStats.categoryStats[catId]?.income || 0}
                    expense={monthlyStats.categoryStats[catId]?.expense || 0}
                    percent={monthlyStats.categoryStatsPercent[catId]?.incomePercent.toFixed(1) || 0}
                    background={colors.accent}
                />

                <ChartIncomeExpense
                    title={t('expense')}
                    money={monthlyStats.categoryStats[catId]?.expense || 0}
                    color='white'
                    income={monthlyStats.categoryStats[catId]?.expense || 0}
                    expense={monthlyStats.categoryStats[catId]?.income || 0}
                    percent={monthlyStats.categoryStatsPercent[catId]?.expensePercent.toFixed(1) || 0}
                    background={colors.red}
                />

                <View style={{ borderLeftWidth: 3, borderLeftColor: colors.text, flexDirection: "row", justifyContent: "space-between", alignItems: 'center', paddingLeft: 10, marginVertical: 20 }}>
                    <View>
                        <Text style={{ color: colors.text, fontSize: 16, fontWeight: 'bold' }}>{t('totalRatio')}</Text>
                        <Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold' }}>{monthlyStats.categoryPercent[catId]?.toFixed(1) || 0}%</Text>
                    </View>
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

    // Income vs Expense chart component
    const ChartIncomeExpense = ({ title, money, color, income, expense, percent, background }) => {
        return (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <View style={{ borderLeftWidth: 3, borderLeftColor: title === t('income') ? colors.accent : colors.red, paddingLeft: 10 }}>
                    <Text style={{ color: title === t('income') ? colors.accent : colors.red, fontSize: 16, fontWeight: 'bold' }}>{title}</Text>
                    <Text style={{ color: title === t('income') ? colors.accent : colors.red, fontSize: 18, fontWeight: 'bold' }}>{fmt(money)}</Text>
                    <Text style={{ color: colors.gray, fontSize: 14 }}>{percent}%</Text>
                </View>
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


    return (
        <View style={[styles.containerBody, { backgroundColor: colors.background }]}>
            <Nav />

            {/* card */}
            <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                <View>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                        <Landmark size={14} color={colors.text} />
                        <Text style={[styles.text, { color: colors.text }]}>{fmt(allTimeStats.bank)}</Text>
                    </View>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                        <Banknote size={14} color={colors.text} />
                        <Text style={[styles.text, { color: colors.text }]}>{fmt(allTimeStats.cash)}</Text>
                    </View>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                        <Archive size={14} color={colors.text} />
                        <Text style={[styles.text, { color: colors.text }]}>{fmt(allTimeStats.netProfit)}</Text>
                    </View>
                    <Text style={[styles.textHeader, { color: colors.accent }]}>{fmt(allTimeStats.balance)}</Text>
                </View>

                <PieChartComponent
                    income={allTimeStats.totalIncome}
                    expense={allTimeStats.totalExpense}
                    size={100}
                    color={colors.red}
                    onPieClick={() => setPopupMoney(true)}
                    background={colors.accent}
                />
            </View>


            {/* list */}
            <View style={[styles.cardList, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
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

            <Footer />

            {/* popup รายรับ-รายจ่าย */}
            {popupMoney && (
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={!!popupMoney}
                    onRequestClose={() => setPopupMoney(null)}
                >
                    <BlurView intensity={30} tint="dark" style={styles.popupContainer}>
                        <TouchableOpacity
                            style={styles.popupshadow}
                            activeOpacity={1}
                            onPress={() => setPopupMoney(null)}
                        >
                            <View style={[styles.popupMoney, { backgroundColor: colors.cardBg, transform: [{ translateX: -horizontalScale(150) }, { translateY: -verticalScale(280) }] }]}>
                                <X
                                    onPress={() => setPopupMoney(null)}
                                    size={24}
                                    color={colors.text}
                                    style={{ position: "absolute", right: 15, top: 15, zIndex: 100 }}
                                />

                                <View>
                                    <Text style={[styles.textSmInPopup, { color: colors.text, marginBottom: 20 }]}>{t('monthlyData')} : {formatMonthYear()}</Text>
                                    <ChartIncomeExpense
                                        title={t('income')}
                                        money={monthlyStats.totalIncome || 0}
                                        color='white'
                                        income={monthlyStats.totalIncome || 0}
                                        expense={monthlyStats.totalExpense || 0}
                                        percent={monthlyStats.incomePercent.toFixed(1)}
                                        background={colors.accent}
                                    />
                                    <ChartIncomeExpense
                                        title={t('expense')}
                                        money={monthlyStats.totalExpense || 0}
                                        color='white'
                                        income={monthlyStats.totalExpense || 0}
                                        expense={monthlyStats.totalIncome || 0}
                                        percent={monthlyStats.expensePercent.toFixed(1)}
                                        background={colors.red}
                                    />
                                    <Text style={{ color: colors.text, marginBottom: 10, marginTop: 20, textAlign: 'center', fontWeight: 'bold' }}>{t('expenseByCat')}</Text>
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
                    <BlurView intensity={30} tint="dark" style={styles.popupContainer}>
                        <TouchableOpacity
                            style={styles.popupshadow}
                            activeOpacity={1}
                            onPress={() => setPopupGroup(null)}
                        >
                            <GroupPopup catId={popupGroup} />
                        </TouchableOpacity>
                    </BlurView>
                </Modal>
            )}

            {/* popup About */}
            <Modal visible={isOpen} transparent animationType="fade" onRequestClose={closePopup}>
                <BlurView intensity={30} tint="dark" style={styles.popupContainer}>
                    <View style={dialogStyles.overlay}>
                        <TouchableOpacity
                            style={dialogStyles.backdrop}
                            activeOpacity={1}
                            onPress={closePopup}
                        />
                        <View style={[dialogStyles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                            <X
                                onPress={closePopup}
                                size={24}
                                color={colors.text}
                                style={{ position: "absolute", right: 15, top: 15, zIndex: 100 }}
                            />

                            <View style={dialogStyles.aboutHeader}>
                                <Image source={require('../imgs/Logo_FWH.png')} style={dialogStyles.aboutLogo} />
                                <Text style={[dialogStyles.title, { color: colors.text }]}>FakeWalletHub</Text>
                                <View style={[dialogStyles.versionTag, { backgroundColor: colors.accent + '35' }]}>
                                    <Text style={{ color: colors.accent, fontSize: 12, fontWeight: 'bold' }}>v1.0.0</Text>
                                </View>
                            </View>

                            <View style={dialogStyles.aboutContent}>
                                <Text style={[dialogStyles.aboutDesc, { color: colors.text }]}>
                                    {t('aboutDescFull')}
                                </Text>

                                <View style={[dialogStyles.divider, { backgroundColor: colors.text + '50' }]} />

                                <View style={dialogStyles.infoRow}>
                                    <Text style={[dialogStyles.infoLabel, { color: colors.gray }]}>{t('developer')}</Text>
                                    <Text style={[dialogStyles.infoValue, { color: colors.text }]}>Chockpipat Kongdee</Text>
                                </View>

                                <View style={dialogStyles.infoRow}>
                                    <Text style={[dialogStyles.infoLabel, { color: colors.gray }]}>{t('license')}</Text>
                                    <Text style={[dialogStyles.infoValue, { color: colors.text }]}>MIT License</Text>
                                </View>

                                <View style={[dialogStyles.divider, { backgroundColor: colors.text + '50' }]} />

                                <View style={dialogStyles.linksContainer}>
                                    <TouchableOpacity style={dialogStyles.linkItem} onPress={() => Linking.openURL(GITHUB_URL)}>
                                        <Github size={20} color={colors.accent} />
                                        <Text style={{ color: colors.accent, marginLeft: 8 }}>GitHub</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={dialogStyles.linkItem} onPress={() => Linking.openURL(`mailto:${CONTACT_EMAIL}`)}>
                                        <Mail size={20} color={colors.accent} />
                                        <Text style={{ color: colors.accent, marginLeft: 8 }}>Contact</Text>
                                    </TouchableOpacity>
                                </View>

                                <View style={dialogStyles.footer}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                                        <Text style={{ color: colors.gray, fontSize: 11 }}>Made with </Text>
                                        <Heart size={10} color={colors.red} fill={colors.red} />
                                        <Text style={{ color: colors.gray, fontSize: 11 }}> in Thailand</Text>
                                    </View>
                                </View>
                            </View>

                            <TouchableOpacity
                                style={[dialogStyles.primaryButton, { backgroundColor: colors.accent }]}
                                onPress={closePopup}
                                activeOpacity={0.9}
                            >
                                <Text style={[dialogStyles.primaryButtonText, { color: colors.background }]}>{t('close')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </BlurView>
            </Modal>
        </View>
    );
}


const styles = StyleSheet.create({
    containerBody: {
        flex: 1,
        padding: horizontalScale(20),
    },
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
    textHeader: {
        fontSize: SIZES.xl,
        fontWeight: FONTS.bold,
    },
    text: {
        fontSize: SIZES.sm,
        fontWeight: FONTS.normal,
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
    cardText: {
        fontSize: SIZES.sm,
        fontWeight: FONTS.normal,
    },
    cardTextMoney: {
        fontSize: SIZES.base,
        fontWeight: FONTS.bold,
    },
    cardPie: {
        flex: 1,
        alignItems: "flex-end",
    },
    popupContainer: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    popupshadow: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.4)",
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
    textSmInPopup: {
        fontSize: SIZES.xs,
        fontWeight: FONTS.normal,
    },
});

const dialogStyles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    card: {
        width: '85%',
        borderRadius: moderateScale(24),
        paddingVertical: verticalScale(24),
        paddingHorizontal: horizontalScale(20),
        borderWidth: 1,
        ...CARD_SHADOW,
    },
    aboutHeader: {
        alignItems: 'center',
        marginBottom: verticalScale(16),
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
    aboutContent: {
        marginTop: verticalScale(10),
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
    infoLabel: {
        fontSize: moderateScale(13),
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