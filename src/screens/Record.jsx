import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Animated,
    Easing,
    Platform,
    Modal,
} from "react-native"
import { useState, useRef, useEffect, useCallback } from "react"
import { useNavigation, useFocusEffect } from "@react-navigation/native"
import DateTimePicker from "@react-native-community/datetimepicker"
import { BlurView } from 'expo-blur';

// components
import { SIZES, FONTS, CARD_SHADOW, COLORS } from "../style/Theme"
import { useTheme } from "../context/ThemeContext"
import { useTransaction } from "../context/TransactionContext"
import { useLanguage } from "../context/LanguageContext"
import { useCurrency } from "../context/CurrencyContext"
import { useCategory } from "../context/CategoryContext"
import { LIST_TYPE_CASH, LIST_TYPE_BANK } from "../server/database"
import ConfirmPopup from "../components/ConfirmPopup";
import Footer from "../components/Footer";

// icons
import {
    Landmark,
    Banknote,
    X,
    CalendarDays,
    Trash2,
    Pencil,
    Scroll,
    Archive
} from 'lucide-react-native';

export default function Record() {
    const navigation = useNavigation();
    const [filter, setFilter] = useState("all");
    const [dateFilter, setDateFilter] = useState(null);
    const [pickerDate, setPickerDate] = useState(() => new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showActionModal, setShowActionModal] = useState(false);
    const [popupDelete, setPopupDelete] = useState(false);
    const [actionItem, setActionItem] = useState(null);
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const listEntranceAnim = useRef(new Animated.Value(0)).current;
    const { colors } = useTheme();
    const { transactions, loadTransactions, removeTransaction } = useTransaction();
    const { t, formatDateByLang } = useLanguage();
    const { formatMoney } = useCurrency();
    const { getCategoryDisplayName } = useCategory();
    const [transactionToDelete, setTransactionToDelete] = useState(null);

    const FILTERS = [
        { id: "all", label: t('all') },
        { id: "income", label: t('income') },
        { id: "expense", label: t('expense') },
    ]

    const formatAmount = (amount, type) => {
        const sign = type === "income" ? "+" : "-"
        return `${sign} ${formatMoney(amount)}`
    }

    const handleDeleteClick = (item) => {
        setTransactionToDelete(item);
        setPopupDelete(true);
    };

    const confirmDelete = async () => {
        if (transactionToDelete) {
            await removeTransaction(transactionToDelete.id);
            setTransactionToDelete(null);
            setPopupDelete(false);
        }
    };

    // Reload data when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            loadTransactions();
        }, [loadTransactions])
    );

    useEffect(() => {
        Animated.timing(listEntranceAnim, {
            toValue: 1,
            duration: 400,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
        }).start()
    }, [])

    // กรองรายการ
    let filteredRecords =
        filter === "all"
            ? transactions
            : transactions.filter((r) => r.type === filter)
    if (dateFilter) {
        filteredRecords = filteredRecords.filter((r) => r.date === dateFilter)
    }

    const openAction = (item) => {
        setActionItem(item)
        setShowActionModal(true)
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            friction: 8,
            tension: 80,
        }).start()
    }

    const closeAction = () => {
        Animated.timing(scaleAnim, {
            toValue: 0,
            duration: 150,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
        }).start(() => {
            setShowActionModal(false)
            setActionItem(null)
        })
    }

    const handleEdit = () => {
        closeAction()
        navigation.navigate("AddList", { editItem: actionItem })
    }

    const handleDelete = async () => {
        if (actionItem) {
            await removeTransaction(actionItem.id)
        }
        setPopupDelete(false)
        setActionItem(null)
    }

    const showPopupDelete = () => {
        handleDeleteClick(actionItem)
        setShowActionModal(false)
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            friction: 8,
            tension: 80,
        }).start()
    }

    // Date picker
    const dateToYYYYMMDD = (date) => {
        const y = date.getFullYear()
        const m = String(date.getMonth() + 1).padStart(2, "0")
        const d = String(date.getDate()).padStart(2, "0")
        return `${y}-${m}-${d}`
    }

    const onDatePickerChange = (event, selectedDate) => {
        if (Platform.OS === "android") setShowDatePicker(false)
        if (event.type === "set") {
            const next = selectedDate || pickerDate
            setPickerDate(next)
            setDateFilter(dateToYYYYMMDD(next))
        }
    }

    const openDatePicker = () => {
        setPickerDate(dateFilter ? new Date(dateFilter + "T12:00:00") : new Date())
        setShowDatePicker(true)
    }

    const clearDateFilter = () => {
        setDateFilter(null)
    }

    // Get display name for listType constant
    const getListTypeDisplay = (listType) => {
        if (listType === LIST_TYPE_CASH) return t('cash');
        if (listType === LIST_TYPE_BANK) return t('accountInBank');
        return listType;
    }

    // ลิสต์ตัวกรอง
    function FilterChip({ item, filter, setFilter }) {
        const isActive = filter === item.id
        return (
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setFilter(item.id)}
                style={[styles.filterChip, { backgroundColor: isActive ? colors.accent : colors.cardBg }]}
            >
                <Text style={[styles.filterChipText, { color: isActive ? colors.background : colors.text }]}>
                    {item.label}
                </Text>
            </TouchableOpacity>
        )
    }

    // icon ตาม listType
    function iconMoney(listType, isIncome) {
        return (
            listType === LIST_TYPE_CASH
                ? <Banknote size={24} color={isIncome ? colors.accent : colors.red} />
                : listType === LIST_TYPE_BANK
                    ? <Landmark size={24} color={isIncome ? colors.accent : colors.red} />
                    : <Archive size={24} color={isIncome ? colors.accent : colors.red} />
        )
    }

    // รายการ
    function RecordRow({ item, index, entranceAnim, openAction }) {
        const isIncome = item.type === "income"
        const listType = item.listType || LIST_TYPE_CASH

        const opacity = entranceAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
        })

        const translateY = entranceAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [20 + index * 4, 0],
        })

        return (
            <Animated.View style={{ opacity, transform: [{ translateY }] }}>
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => openAction(item)}
                    style={[
                        styles.listbox,
                        { borderLeftColor: isIncome ? colors.accent : colors.red, backgroundColor: colors.cardBg },
                    ]}
                >
                    <View style={styles.listContent}>
                        <View style={styles.list_textHead}>
                            <Text style={[styles.textMoney, { color: isIncome ? colors.accent : colors.red }]}>
                                {formatAmount(item.amount, item.type)}
                            </Text>
                            <Text style={[styles.textList, { color: colors.text }]}>{isIncome ? t('income') : t('expense')}</Text>
                        </View>
                        <View style={styles.list_text}>
                            <Text style={[styles.textAbout, { color: colors.gray }]}>{formatDateByLang(item.date)}</Text>
                            <Text style={[styles.textGroup, { color: colors.gray }]}>{getCategoryDisplayName(item.category)}</Text>
                        </View>
                        <Text style={[styles.textAbout, { color: colors.text }]} numberOfLines={1}>
                            {item.title === 'ไม่ระบุชื่อ' ? t('anonymous') : item.title}
                        </Text>
                    </View>
                    <View style={[styles.listLogo, {
                        backgroundColor: isIncome ? colors.accent_black : "#ff000040",
                        borderColor: isIncome ? colors.accent_border : "#ff000050"
                    }]}>
                        {iconMoney(listType, isIncome)}
                    </View>
                </TouchableOpacity>
            </Animated.View>
        )
    }

    // Empty state
    function EmptyState({ filter, dateFilter, setFilter, setDateFilter }) {
        return (
            <View style={styles.emptyState}>
                <View style={[styles.emptyIconWrap, { backgroundColor: colors.chart }]}>
                    <Scroll size={48} color={colors.text} />
                </View>
                <Text style={[styles.emptyTitle, { color: colors.text }]}>{t('noTransaction')}</Text>
                <Text style={[styles.emptySub, { color: colors.gray }]}>
                    {filter === "all" && !dateFilter
                        ? t('add')
                        : t('noTransaction')}
                </Text>
                {(filter !== "all" || dateFilter) && (
                    <TouchableOpacity
                        style={[styles.emptyButton, { backgroundColor: colors.accent }]}
                        onPress={() => {
                            setFilter("all")
                            setDateFilter(null)
                        }}
                    >
                        <Text style={[styles.emptyButtonText, { color: colors.background }]}>{t('all')}</Text>
                    </TouchableOpacity>
                )}
            </View>
        )
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Text style={[styles.textHeader, { color: colors.text }]}>{t('record')}</Text>

            {/* ตัวกรอง */}
            <View style={styles.filterRow}>
                {FILTERS.map((f) => (
                    <FilterChip key={f.id} item={f} filter={filter} setFilter={setFilter} />
                ))}
            </View>

            {/* เลือกวันที่ */}
            <View style={styles.dateFilterRow}>
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={openDatePicker}
                    style={[styles.filterChip, { backgroundColor: dateFilter ? colors.accent : colors.cardBg }]}
                >
                    <CalendarDays
                        size={18}
                        color={dateFilter ? colors.background : colors.text}
                        style={{ marginRight: 6 }}
                    />
                    <Text style={[styles.filterChipText, { color: dateFilter ? colors.background : colors.text }]}>
                        {dateFilter ? formatDateByLang(dateFilter) : t('date')}
                    </Text>
                </TouchableOpacity>

                {/* Clear Date Filter */}
                {dateFilter && (
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={clearDateFilter}
                        style={[styles.dateFilterClear, { backgroundColor: colors.red }]}
                    >
                        <X size={18} color={colors.white} />
                        <Text style={[styles.dateFilterClearText, { color: colors.white }]}>{t('clear')}</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Date Picker */}
            {showDatePicker && (
                <DateTimePicker
                    value={pickerDate}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={onDatePickerChange}
                    onTouchCancel={() => Platform.OS === "ios" && setShowDatePicker(false)}
                />
            )}

            {/* Date Picker Actions */}
            {Platform.OS === "ios" && showDatePicker && (
                <View style={styles.datePickerActions}>
                    <TouchableOpacity onPress={() => setShowDatePicker(false)} style={styles.datePickerBtn}>
                        <Text style={styles.datePickerBtnText}>{t('cancel')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => {
                            setDateFilter(dateToYYYYMMDD(pickerDate))
                            setShowDatePicker(false)
                        }}
                        style={[styles.datePickerBtn, styles.datePickerBtnConfirm]}
                    >
                        <Text style={[styles.datePickerBtnText]}>{t('ok')}</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* รายการ */}
            <Animated.View style={styles.listContainer}>
                <FlatList
                    data={filteredRecords}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item, index }) => (
                        <RecordRow item={item} index={index} entranceAnim={listEntranceAnim} openAction={openAction} />
                    )}
                    contentContainerStyle={[
                        styles.listContentContainer,
                        filteredRecords.length === 0 && styles.listContentEmpty,
                    ]}
                    ListEmptyComponent={<EmptyState filter={filter} dateFilter={dateFilter} setFilter={setFilter} setDateFilter={setDateFilter} />}
                    showsVerticalScrollIndicator={false}
                />
            </Animated.View>

            <Footer />

            {/* Modal แก้ไข / ลบ */}
            {showActionModal && actionItem && (
                <Modal visible={showActionModal} transparent={true} animationType="fade">
                    <BlurView intensity={30} tint="dark" style={styles.modalOverlay}>
                        <TouchableOpacity
                            style={styles.modalBackdrop}
                            activeOpacity={1}
                            onPress={closeAction}
                        />
                        <Animated.View
                            style={[
                                styles.actionModal,
                                {
                                    transform: [{ scale: scaleAnim }],
                                    backgroundColor: colors.cardBg
                                },
                            ]}
                        >
                            <TouchableOpacity
                                style={styles.modalClose}
                                onPress={closeAction}
                            >
                                <X size={24} color={colors.text} />
                            </TouchableOpacity>
                            <Text style={[styles.actionModalTitle, { color: colors.text, marginBottom: 15 }]}>{actionItem.title}</Text>
                            <Text style={[styles.actionModalAmount, { color: actionItem.type === "income" ? colors.accent : colors.red }]}>
                                {formatAmount(actionItem.amount, actionItem.type)}
                            </Text>
                            <Text style={[styles.actionModalMeta, { color: colors.text }]}>
                                {t('title')} : <Text style={{ fontWeight: FONTS.normal }}>{actionItem.type === "income" ? t('income') : t('expense')}</Text>
                            </Text>
                            <Text style={[styles.actionModalMeta, { color: colors.text }]}>
                                {t('listTypeTitle')} : <Text style={{ fontWeight: FONTS.normal }}>{getListTypeDisplay(actionItem.listType)}</Text>
                            </Text>
                            <Text style={[styles.actionModalMeta, { color: colors.text }]}>
                                {t('category')} : <Text style={{ fontWeight: FONTS.normal }}>{getCategoryDisplayName(actionItem.category)}</Text>
                            </Text>
                            <Text style={[styles.actionModalMeta, { marginTop: 20, fontWeight: FONTS.bold, color: colors.text }]}>
                                {t('date')} : <Text style={{ fontWeight: FONTS.normal }}>{formatDateByLang(actionItem.date)}</Text>
                            </Text>
                            <View style={styles.actionButtons}>
                                <TouchableOpacity
                                    style={[styles.actionBtnEdit, { backgroundColor: colors.accent }]}
                                    onPress={handleEdit}
                                    activeOpacity={0.8}
                                >
                                    <Pencil size={20} color={colors.background} />
                                    <Text style={[styles.actionBtnEditText, { color: colors.background }]}>{t('edit')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.actionBtnDelete, { backgroundColor: colors.red }]}
                                    onPress={showPopupDelete}
                                    activeOpacity={0.8}
                                >
                                    <Trash2 size={20} color={colors.white} />
                                    <Text style={[styles.actionBtnDeleteText, { color: colors.white }]}>{t('delete')}</Text>
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                    </BlurView>
                </Modal>
            )}

            <ConfirmPopup
                visible={popupDelete}
                onCancel={() => {
                    setPopupDelete(false);
                }}
                onConfirm={confirmDelete}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    textHeader: {
        fontSize: SIZES.xl,
        fontWeight: FONTS.bold,
        marginVertical: 30,
        textAlign: "center",
    },
    filterRow: {
        flexDirection: "row",
        gap: 10,
        marginBottom: 12,
    },
    dateFilterRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginBottom: 20,
    },
    dateFilterClear: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 20,
        ...CARD_SHADOW
    },
    dateFilterClearText: {
        fontSize: SIZES.xs,
        fontWeight: FONTS.semibold,
    },
    datePickerActions: {
        flexDirection: "row",
        justifyContent: "flex-end",
        gap: 12,
        paddingHorizontal: 4,
        paddingVertical: 8,
        marginBottom: 8,
    },
    datePickerBtn: {
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    datePickerBtnConfirm: {
        borderRadius: 20,
    },
    datePickerBtnText: {
        fontSize: SIZES.sm,
        fontWeight: FONTS.semibold,
    },
    filterChip: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...CARD_SHADOW
    },
    filterChipText: {
        fontSize: SIZES.xs,
        fontWeight: FONTS.semibold,
    },
    listContentContainer: {
        paddingBottom: 100,
        gap: 12,
    },
    listContentEmpty: {
        flexGrow: 1,
    },
    listbox: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderRadius: 12,
        width: "100%",
        paddingVertical: 14,
        paddingLeft: 16,
        paddingRight: 14,
        borderLeftWidth: 5,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...CARD_SHADOW,
    },
    listContent: {
        flex: 1,
        marginRight: 12,
    },
    list_textHead: {
        flexDirection: "row",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 8,
    },
    textMoney: {
        fontSize: SIZES.sm,
        fontWeight: FONTS.bold,
    },
    textList: {
        fontSize: SIZES.xs,
        fontWeight: FONTS.semibold,
    },
    list_text: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginTop: 4,
    },
    textAbout: {
        fontSize: SIZES.xs,
        fontWeight: FONTS.regular,
        marginTop: 2,
    },
    textGroup: {
        fontSize: SIZES.xs,
        fontWeight: FONTS.semibold,
    },
    listLogo: {
        width: 50,
        height: 50,
        borderRadius: 50,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
    },
    emptyState: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 60,
    },
    emptyIconWrap: {
        width: 88,
        height: 88,
        borderRadius: 44,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: SIZES.base,
        fontWeight: FONTS.bold,
        marginBottom: 6,
    },
    emptySub: {
        fontSize: SIZES.sm,
        textAlign: "center",
        marginBottom: 16,
    },
    emptyButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
    },
    emptyButtonText: {
        fontSize: SIZES.sm,
        fontWeight: FONTS.bold,
    },
    modalOverlay: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 1000,
    },
    modalBackdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.1)",
        zIndex: 1,
    },
    actionModal: {
        position: "absolute",
        left: 24,
        right: 24,
        top: "35%",
        borderRadius: 16,
        padding: 24,
        borderWidth: 1,
        borderColor: COLORS.border,
        zIndex: 2,
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    modalClose: {
        position: "absolute",
        right: 16,
        top: 16,
        zIndex: 1,
    },
    actionModalTitle: {
        fontSize: SIZES.base,
        fontWeight: FONTS.bold,
        textAlign: "center",
    },
    actionModalAmount: {
        fontSize: SIZES.xl,
        fontWeight: FONTS.bold,
        marginBottom: 4,
    },
    actionModalMeta: {
        fontSize: SIZES.xs,
        marginBottom: 5,
        fontWeight: FONTS.bold,
    },
    actionButtons: {
        flexDirection: "row",
        gap: 12,
        marginTop: 20,
    },
    actionBtnEdit: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingVertical: 14,
        borderRadius: 12,
        zIndex: 3,
        elevation: 3,
    },
    actionBtnEditText: {
        fontSize: SIZES.sm,
        fontWeight: FONTS.bold,
    },
    actionBtnDelete: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingVertical: 14,
        borderRadius: 12,
        zIndex: 3,
        elevation: 3,
    },
    actionBtnDeleteText: {
        fontSize: SIZES.sm,
        fontWeight: FONTS.bold,
        textAlign: "center",
    },
    listContainer: {
        borderRadius: 10,
        overflow: "hidden",
        height: "58%",
    },
})
