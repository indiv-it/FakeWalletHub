import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Modal,
} from "react-native"
import { useState, useMemo } from "react";

// components
import { SIZES, FONTS, CARD_SHADOW, COLORS } from '../style/Theme';
import { useTheme } from '../context/ThemeContext';
import { useTransaction } from '../context/TransactionContext';
import { usePopup } from '../context/PopupContext';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import PieChartComponent from '../components/pieChart';

// icons
import {
    Archive,
    Landmark,
    Banknote,
    PiggyBank,
    ShoppingCart,
    ShoppingBag,
    ChartColumnBig,
    X
} from 'lucide-react-native';

export default function Home() {
    const { colors } = useTheme();
    const { transactions } = useTransaction(); // ข้อมูลการทำรายการจริง
    const [popupMoney, setPopupMoney] = useState(null); // ป้อปอัพรายรับ-รายจ่าย
    const [popupGroup, setPopupGroup] = useState(null); // ป้อปอัพหมวดหมู่เงิน
    const { isOpen, closePopup } = usePopup();

    // คำนวณค่าสถิติจากข้อมูลจริง
    const stats = useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        // กรองข้อมูลการทำรายการในเดือนปัจจุบัน
        const monthlyTx = transactions.filter(tx => {
            const [y, m] = tx.date.split('-').map(Number);
            return y === currentYear && m === currentMonth + 1;
        });

        const validTx = monthlyTx.filter(
            t => t.listType === 'เงินสด' || t.listType === 'เงินในบัญชี'
        );

        const totalIncome = validTx
            .filter(t => t.type === 'income')
            .reduce((s, t) => s + t.amount, 0);

        const totalExpense = validTx
            .filter(t => t.type === 'expense')
            .reduce((s, t) => s + t.amount, 0);

        const bankIncome = validTx
            .filter(t => t.type === 'income' && t.listType === 'เงินในบัญชี')
            .reduce((s, t) => s + t.amount, 0);

        const bankExpense = validTx
            .filter(t => t.type === 'expense' && t.listType === 'เงินในบัญชี')
            .reduce((s, t) => s + t.amount, 0);

        const cashIncome = validTx
            .filter(t => t.type === 'income' && t.listType === 'เงินสด')
            .reduce((s, t) => s + t.amount, 0);

        const cashExpense = validTx
            .filter(t => t.type === 'expense' && t.listType === 'เงินสด')
            .reduce((s, t) => s + t.amount, 0);

        // คำนวณสถิติแต่ละหมวดหมู่
        const categoryStats = {};
        ['เงินจำเป็น', 'เงินตามใจ', 'เงินลงทุน', 'เงินออม'].forEach(cat => {
            const catTx = monthlyTx.filter(t => t.category === cat);
            categoryStats[cat] = {
                income: catTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
                expense: catTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
            };
        });

        // ยอดคงเหลือในแต่ละหมวดหมู่
        const totalCategoryIncome = Object.values(categoryStats).reduce((s, c) => s + c.income, 0);
        const totalCategoryExpense = Object.values(categoryStats).reduce((s, c) => s + c.expense, 0);

        const sumMoney = totalIncome - totalExpense;
        const sumCategory = totalCategoryIncome - totalCategoryExpense;

        return {
            totalIncome,
            totalExpense,
            netProfit: sumMoney - sumCategory,
            balance: sumMoney,
            bank: bankIncome - bankExpense,
            cash: cashIncome - cashExpense,
            categoryStats,
        };
    }, [transactions]);

    // ฟอร์แมตเงิน
    const fmt = (n) => `฿ ${n.toLocaleString('th-TH', { minimumFractionDigits: 2 })}`;

    // ข้อมูลหมวดหมู่
    const categories = [
        { id: 1, name: "เงินจำเป็น", icon: <ShoppingCart size={18} color={colors.background} /> },
        { id: 2, name: "เงินตามใจ", icon: <ShoppingBag size={18} color={colors.background} /> },
        { id: 3, name: "เงินลงทุน", icon: <ChartColumnBig size={18} color={colors.background} /> },
        { id: 4, name: "เงินออม", icon: <PiggyBank size={18} color={colors.background} /> },
    ];

    // กล่องหมวดหมู่
    const CategoryCard = ({ groupName, icon }) => (
        <TouchableOpacity
            style={[styles.list, { borderBottomColor: colors.border, borderBottomWidth: groupName === "เงินออม" ? 0 : 1 }]}
            onPress={() => setPopupGroup(groupName)}
        >
            <View style={[styles.cardIcon, { backgroundColor: colors.accent }]}>
                {icon}
            </View>

            <View>
                <Text style={[styles.cradText, { color: colors.text }]}>{groupName}</Text>
                <Text style={[styles.cradTextMoney, { color: colors.accent }]}>{fmt((stats.categoryStats[groupName]?.income || 0) - (stats.categoryStats[groupName]?.expense || 0))}</Text>
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


    // ป็อปอัพหมวดหมู่
    const GroupPopup = ({ groupName, icon }) => (
        <View style={[styles.popupMoney, { backgroundColor: colors.cardBg }]}>
            <X
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
                        <Text style={{ color: colors.accent }}>รายรับ</Text>
                        <Text style={{ color: colors.accent }}>{fmt(stats.categoryStats[groupName]?.income || 0)}</Text>
                    </View>

                    <View style={{ alignItems: "center" }}>
                        <Text style={{ color: colors.red }}>รายจ่าย</Text>
                        <Text style={{ color: colors.red }}>{fmt(stats.categoryStats[groupName]?.expense || 0)}</Text>
                    </View>
                </View>

                <View style={[styles.popupMoneyBox, { backgroundColor: colors.red }]}>
                    <View style={{
                        backgroundColor: colors.accent,
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
                    <View style={{ width: "80%", backgroundColor: colors.accent, height: 3, borderRadius: 50 }} />
                </View>

                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 20 }}>
                    <Text style={{ color: colors.text }}>รายจ่ายทั้งหมด</Text>
                    <Text style={{ color: colors.text, fontSize: 11 }}>0.0%</Text>
                </View>
                <View style={[styles.popupLine, { backgroundColor: colors.chart }]}>
                    <View style={{ width: "30%", backgroundColor: colors.accent, height: 3, borderRadius: 50 }} />
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
                        <Landmark size={14} color={colors.text} />
                        <Text style={[styles.text, { color: colors.text }]}>{fmt(stats.bank)}</Text>
                    </View>

                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                        <Banknote size={14} color={colors.text} />
                        <Text style={[styles.text, { color: colors.text }]}>{fmt(stats.cash)}</Text>
                    </View>

                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                        <Archive size={14} color={colors.text} />
                        <Text style={[styles.text, { color: colors.text }]}>{fmt(stats.netProfit)}</Text>
                    </View>

                    <Text style={[styles.textHeader, { color: colors.accent }]}>{fmt(stats.balance)}</Text>
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
                        <X
                            onPress={() => setPopupMoney(null)}
                            size={24}
                            color={colors.text}
                            style={{ position: "absolute", right: 15, top: 15, zIndex: 99 }}
                        />

                        <View>
                            <Text style={[styles.textSmInPopup, { color: colors.text }]}>ประจำเดือน : มกราคม</Text>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
                                <View style={{ borderLeftWidth: 3, borderLeftColor: colors.accent, paddingLeft: 10 }}>
                                    <Text style={{ color: colors.accent, fontSize: 16, fontWeight: 'bold' }}>รายรับ</Text>
                                    <Text style={{ color: colors.accent, fontSize: 18, fontWeight: 'bold' }}>{fmt(stats.totalIncome || 0)}</Text>
                                    <Text style={{ color: colors.gray, fontSize: 14 }}>70%</Text>
                                </View>
                                <PieChartComponent
                                    income={stats.totalIncome || 0}
                                    expense={stats.totalExpense || 0}
                                    size={80}
                                    color="white"
                                />
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
                                <View style={{ borderLeftWidth: 3, borderLeftColor: colors.red, paddingLeft: 10, marginTop: 10 }}>
                                    <Text style={{ color: colors.red, fontSize: 16, fontWeight: 'bold' }}>รายจ่าย</Text>
                                    <Text style={{ color: colors.red, fontSize: 18, fontWeight: 'bold' }}>{fmt(stats.totalExpense || 0)}</Text>
                                    <Text style={{ color: colors.gray, fontSize: 14 }}>30%</Text>
                                </View>
                                <PieChartComponent
                                    income={stats.totalExpense || 0}
                                    expense={stats.totalIncome || 0}
                                    size={80}
                                    color='white'
                                    background="red"
                                />
                            </View>
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

            {/* popup About */}
            <Modal visible={isOpen} transparent animationType="fade">
                <View style={dialogStyles.overlay}>
                    <TouchableOpacity
                        style={dialogStyles.backdrop}
                        activeOpacity={1}
                        onPress={closePopup}
                    />
                    <View style={[dialogStyles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                        <View>
                            <Text style={[dialogStyles.title, { color: colors.text }]}>เกี่ยวกับ MyBank</Text>
                            <Text style={[dialogStyles.message, { color: colors.textSecondary }]}>
                                แอปสำหรับบันทึกและวิเคราะห์รายรับ-รายจ่ายของคุณ{'\n'}
                                เวอร์ชัน 1.0.0
                            </Text>
                            <TouchableOpacity
                                style={[dialogStyles.primaryButton, { backgroundColor: colors.accent }]}
                                onPress={closePopup}
                                activeOpacity={0.9}
                            >
                                <Text style={[dialogStyles.primaryButtonText, { color: colors.background }]}>ปิด</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
        borderColor: COLORS.border,
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
        paddingVertical: 15,
    },
    cardList: {
        borderRadius: 10,
        padding: 10,
        overflow: "hidden",
        paddingHorizontal: 20,
        borderColor: COLORS.border,
        borderWidth: 1,
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
        borderWidth: 1,
        borderColor: COLORS.border,
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

const dialogStyles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    card: {
        width: '82%',
        backgroundColor: COLORS.cardBg,
        borderRadius: 18,
        paddingVertical: 20,
        paddingHorizontal: 18,
        borderWidth: 1,
        borderColor: COLORS.chart,
    },
    title: {
        fontSize: SIZES.base,
        fontWeight: FONTS.bold,
        color: COLORS.white,
        marginBottom: 8,
        textAlign: 'center',
    },
    message: {
        fontSize: SIZES.xs,
        color: COLORS.background_White,
        textAlign: 'center',
        lineHeight: 18,
        marginBottom: 18,
    },
    primaryButton: {
        backgroundColor: COLORS.accent,
        borderRadius: 999,
        paddingVertical: 10,
        paddingHorizontal: 18,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        minWidth: 140,
    },
    primaryButtonText: {
        fontSize: SIZES.sm,
        fontWeight: FONTS.bold,
        color: COLORS.black,
    },
    rowButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    secondaryButton: {
        flex: 1,
        borderRadius: 999,
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: COLORS.chart,
    },
    secondaryButtonText: {
        fontSize: SIZES.sm,
        fontWeight: FONTS.semibold,
        color: COLORS.background_White,
    },
});