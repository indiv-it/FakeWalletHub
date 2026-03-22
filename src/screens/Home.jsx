import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
} from "react-native"
import { useState, useMemo } from "react";

// components
import { SIZES, FONTS, CARD_SHADOW } from '../style/Theme';
import { useTheme } from '../context/ThemeContext';
import { useTransaction } from '../context/TransactionContext';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import PieChartComponent from '../components/pieChart';

// icons
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Ionicons from '@expo/vector-icons/Ionicons';
import Entypo from '@expo/vector-icons/Entypo';


export default function Home() {
    const { colors } = useTheme();
    const { transactions } = useTransaction();
    const [popupMoney, setPopupMoney] = useState(null);
    const [popupGroup, setPopupGroup] = useState(null);

    // Compute aggregated values from real data
    const stats = useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        // Filter to current month
        const monthlyTx = transactions.filter(tx => {
            const [y, m] = tx.date.split('-').map(Number);
            return y === currentYear && m === currentMonth + 1;
        });

        const totalIncome = monthlyTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
        const totalExpense = monthlyTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
        const bankIncome = monthlyTx.filter(t => t.type === 'income' && t.listType === 'เงินในบัญชี').reduce((s, t) => s + t.amount, 0);
        const bankExpense = monthlyTx.filter(t => t.type === 'expense' && t.listType === 'เงินในบัญชี').reduce((s, t) => s + t.amount, 0);
        const cashIncome = monthlyTx.filter(t => t.type === 'income' && t.listType === 'เงินสด').reduce((s, t) => s + t.amount, 0);
        const cashExpense = monthlyTx.filter(t => t.type === 'expense' && t.listType === 'เงินสด').reduce((s, t) => s + t.amount, 0);

        // Per-category stats
        const categoryStats = {};
        ['เงินจำเป็น', 'เงินตามใจ', 'เงินลงทุน', 'เงินออม'].forEach(cat => {
            const catTx = monthlyTx.filter(t => t.category === cat);
            categoryStats[cat] = {
                income: catTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
                expense: catTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
            };
        });

        return {
            totalIncome,
            totalExpense,
            netProfit: totalIncome - totalExpense,
            balance: totalIncome - totalExpense,
            bank: bankIncome - bankExpense,
            cash: cashIncome - cashExpense,
            categoryStats,
        };
    }, [transactions]);

    // Format currency
    const fmt = (n) => `฿ ${n.toLocaleString('th-TH', { minimumFractionDigits: 2 })}`;

    const categories = [
        { id: 1, name: "เงินจำเป็น", icon: <FontAwesome6 name="cart-shopping" size={16} color={colors.background} /> },
        { id: 2, name: "เงินตามใจ", icon: <FontAwesome6 name="basket-shopping" size={16} color={colors.background} /> },
        { id: 3, name: "เงินลงทุน", icon: <Ionicons name="bar-chart" size={16} color={colors.background} /> },
        { id: 4, name: "เงินออม", icon: <MaterialCommunityIcons name="piggy-bank" size={16} color={colors.background} /> },
    ];

    const CategoryCard = ({ groupName, icon }) => (
        <TouchableOpacity
            style={[styles.list, { borderBottomColor: colors.border, borderBottomWidth: groupName === "เงินออม" ? 0 : 1 }]}
            onPress={() => setPopupGroup(groupName)}
        >
            <View style={[styles.cardIcon, { backgroundColor: colors.accent}]}>
                {icon}
            </View>

            <View>
                <Text style={[styles.cradText, { color: colors.text }]}>{groupName}</Text>
                <Text style={[styles.cradTextMoney, { color: colors.accent_black }]}>{fmt((stats.categoryStats[groupName]?.income || 0) - (stats.categoryStats[groupName]?.expense || 0))}</Text>
            </View>

            <View style={styles.cardPie}>
                <PieChartComponent
                    income={stats.categoryStats[groupName]?.income || 0}
                    expense={stats.categoryStats[groupName]?.expense || 0}
                    size={60}
                    color="white"
                />
            </View>
        </TouchableOpacity>
    );


    const GroupPopup = ({ groupName, icon }) => (
        <View style={[styles.popupMoney, { backgroundColor: colors.cardBg }]}>
            <Entypo
                name="cross"
                onPress={() => setPopupGroup(null)}
                size={24}
                color={colors.text}
                style={{ position: "absolute", right: 15, top: 15 }}
            />

            <View style={{ flex: 1, justifyContent: "center" }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <View style={[styles.cardIcon, { backgroundColor: colors.accent }]}>{icon}</View>
                    <Text style={[styles.textHeader, { color: colors.text }]}>{groupName}</Text>
                </View>

                <View style={styles.moneyPopup}>
                    <View style={{ alignItems: "center" }}>
                        <Text style={{ color: colors.accent_black }}>รายรับ</Text>
                        <Text style={{ color: colors.accent_black }}>{fmt(stats.categoryStats[groupName]?.income || 0)}</Text>
                    </View>

                    <View style={{ alignItems: "center" }}>
                        <Text style={{ color: colors.red }}>รายจ่าย</Text>
                        <Text style={{ color: colors.red }}>{fmt(stats.categoryStats[groupName]?.expense || 0)}</Text>
                    </View>
                </View>

                <View style={[styles.popupMoneyBox, { backgroundColor: colors.red }]}>
                    <View style={{
                        backgroundColor: colors.accent_black,
                        height: "100%",
                        borderTopLeftRadius: 10,
                        borderBottomLeftRadius: 10,
                        width: "80%",
                    }} />
                </View>

                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 20 }}>
                    <Text style={{ color: colors.text }}>คิดเป็นทั้งหมด</Text>
                    <Text style={{ color: colors.text, fontSize: 11 }}>0.0%</Text>
                </View>
                <View style={[styles.popupLine, { backgroundColor: colors.chart }]}>
                    <View style={{ width: "80%", backgroundColor: colors.accent_black, height: 3, borderRadius: 50 }} />
                </View>

                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 20 }}>
                    <Text style={{ color: colors.text }}>รายจ่ายทั้งหมด</Text>
                    <Text style={{ color: colors.text, fontSize: 11 }}>0.0%</Text>
                </View>
                <View style={[styles.popupLine, { backgroundColor: colors.chart }]}>
                    <View style={{ width: "30%", backgroundColor: colors.accent_black, height: 3, borderRadius: 50 }} />
                </View>
            </View>
        </View>
    );


    return (
        <View style={[styles.containerBody, { backgroundColor: colors.background }]}>
            <Nav />

            {/* card */}
            <View style={[styles.card, { backgroundColor: colors.cardBg }]}>
                <View>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                        <MaterialCommunityIcons name="bank" size={14} color={colors.text} />
                        <Text style={[styles.text, { color: colors.text }]}>{fmt(stats.bank)}</Text>
                    </View>

                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                        <MaterialCommunityIcons name="cash" size={14} color={colors.text} />
                        <Text style={[styles.text, { color: colors.text }]}>{fmt(stats.cash)}</Text>
                    </View>

                    <View style={{ flexDirection: "row" }}>
                        <Text style={{ color: colors.textSecondary, fontSize: SIZES.xs }}>NP: </Text>
                        <Text style={[styles.text, { color: colors.text }]}>{fmt(stats.netProfit)}</Text>
                    </View>

                    <Text style={[styles.textHeader, { color: colors.accent_black }]}>{fmt(stats.balance)}</Text>
                </View>

                <PieChartComponent
                    income={stats.totalIncome}
                    expense={stats.totalExpense}
                    size={100}
                    color="red"
                    onPieClick={() => setPopupMoney(true)}
                />
            </View>


            {/* list */}
            <View style={[styles.cardList, { backgroundColor: colors.cardBg }]}>
                <FlatList
                    data={categories}
                    scrollEnabled={false}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <CategoryCard
                            groupName={item.name}
                            icon={item.icon}
                        />
                    )}
                />
            </View>

            <Footer />


            {/* popup เงิน */}
            {popupMoney && (
                <View style={styles.popupContainer}>
                    <TouchableOpacity
                        style={styles.popupshadow}
                        activeOpacity={1}
                        onPress={() => setPopupMoney(null)}
                    />

                    <View style={[styles.popupMoney, { backgroundColor: colors.cardBg }]}>
                        <Entypo
                            name="cross"
                            onPress={() => setPopupMoney(null)}
                            size={24}
                            color={colors.text}
                            style={{ position: "absolute", right: 15, top: 15 }}
                        />

                        <View style={{ alignItems: "center" }}>
                            <Text style={[styles.textHeader, { color: colors.text }]}>รายรับรายจ่าย</Text>
                            <Text style={[styles.textSmInPopup, { color: colors.textSecondary }]}>ประจำเดือน : มกราคม</Text>
                        </View>

                        <View style={styles.moneyPopup}>
                            <View style={{ alignItems: "center" }}>
                                <Text style={{ color: colors.accent_black }}>รายรับ</Text>
                                <Text style={{ color: colors.accent_black }}>{fmt(stats.totalIncome)}</Text>
                            </View>

                            <View style={{ alignItems: "center" }}>
                                <Text style={{ color: colors.red }}>รายจ่าย</Text>
                                <Text style={{ color: colors.red }}>{fmt(stats.totalExpense)}</Text>
                            </View>
                        </View>

                        <View style={[styles.popupMoneyBox, { backgroundColor: colors.red }]}>
                            <View style={{
                                backgroundColor: colors.accent_black,
                                height: "100%",
                                borderTopLeftRadius: 10,
                                borderBottomLeftRadius: 10,
                                width: "80%",
                            }} />
                        </View>
                    </View>
                </View>
            )}


            {/* popup group */}
            {popupGroup && (
                <View style={styles.popupContainer}>
                    <TouchableOpacity
                        style={styles.popupshadow}
                        activeOpacity={1}
                        onPress={() => setPopupGroup(null)}
                    />

                    <GroupPopup
                        groupName={popupGroup}
                        icon={categories.find(cat => cat.name === popupGroup)?.icon}
                    />

                </View>
            )}

        </View>
    );
}


const styles = StyleSheet.create({
    containerBody: {
        flex: 1,
        padding: 20,
    },
    card: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderRadius: 10,
        height: 150,
        padding: 20,
        marginBottom: 15,
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
        paddingVertical: 15,
    },
    cardList: {
        borderRadius: 10,
        padding: 10,
        overflow: "hidden",
        paddingHorizontal: 20,
        ...CARD_SHADOW
    },
    cardIcon: {
        alignItems: "center",
        justifyContent: "center",
        width: 70,
        height: 50,
        borderRadius: 10,
        marginRight: 10,
    },
    cradText: {
        fontSize: SIZES.sm,
        fontWeight: FONTS.normal,
    },
    cradTextMoney: {
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
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    popupMoney: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: [{ translateX: -150 }, { translateY: -125 }],
        width: 300,
        borderRadius: 10,
        padding: 20,
    },
    textSmInPopup: {
        fontSize: SIZES.xs,
        fontWeight: FONTS.normal,
    },
    moneyPopup: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20,
    },
    popupMoneyBox: {
        width: "100%",
        height: 30,
        borderRadius: 10,
        marginTop: 10,
    },
    popupLine: {
        height: 3,
        marginTop: 5,
        borderRadius: 50,
    }
});