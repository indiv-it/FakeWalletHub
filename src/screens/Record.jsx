import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Animated,
    Easing,
    Platform,
} from "react-native"
import { useState, useRef, useEffect } from "react"
import { useNavigation } from "@react-navigation/native"
import DateTimePicker from "@react-native-community/datetimepicker"
import { COLORS, SIZES, FONTS, CARD_SHADOW } from "../style/Theme"

// components
import Footer from "../components/Footer"

// icons
import Entypo from "@expo/vector-icons/Entypo"
import Ionicons from "@expo/vector-icons/Ionicons"
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

// filters
const FILTERS = [
    { id: "all", label: "ทั้งหมด" },
    { id: "income", label: "รายรับ" },
    { id: "expense", label: "รายจ่าย" },
]

// สร้างข้อมูลตัวอย่างสำหรับประวัติ
const SAMPLE_RECORDS = [
    { id: "1", type: "income", amount: 15000, title: "เงินเดือน", category: "เงินตามใจ", date: "2025-03-05", listType: "เงินสด" },
    { id: "2", type: "expense", amount: 350, title: "ข้าวกลางวัน", category: "เงินจำเป็น", date: "2025-03-06", listType: "เงินในบีญชี" },
    { id: "3", type: "expense", amount: 1200, title: "ค่าอินเทอร์เน็ต", category: "เงินจำเป็น", date: "2025-03-05", listType: "เงินสด" },
    { id: "4", type: "income", amount: 2500, title: "รับจ้างฟรีแลนซ์", category: "เงินลงทุน", date: "2025-03-04", listType: "เงินสด" },
    { id: "5", type: "expense", amount: 500, title: "ของว่าง", category: "เงินตามใจ", date: "2025-03-04", listType: "เงินในบีญชี" },
    { id: "6", type: "expense", amount: 2000, title: "เงินออม", category: "เงินออม", date: "2025-03-03", listType: "เงินในบีญชี" },
]

// แปลงวันที่เป็นรูปแบบ "DD MMM YYYY"
function formatDate(dateStr) {
    const [y, m, d] = dateStr.split("-")
    const months = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."]
    return `${Number(d)} ${months[Number(m) - 1]} ${Number(y) + 543}`
}

// แปลงวันที่เป็นรูปแบบ "YYYY-MM-DD"
function dateToYYYYMMDD(date) {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, "0")
    const d = String(date.getDate()).padStart(2, "0")
    return `${y}-${m}-${d}`
}

// รูปแบบจำนวนเงิน
function formatAmount(amount, type) {
    const sign = type === "income" ? "+" : "-"
    return `${sign}${Number(amount).toLocaleString("th-TH", { minimumFractionDigits: 2 })} ฿`
}

export default function Record() {
    const navigation = useNavigation() // การนำทาง
    const [filter, setFilter] = useState("all") // ตัวกรอง
    const [dateFilter, setDateFilter] = useState(null) // "YYYY-MM-DD" or null
    const [pickerDate, setPickerDate] = useState(() => new Date()) // วันที่
    const [showDatePicker, setShowDatePicker] = useState(false) // แสดงวันที่
    const [records, setRecords] = useState(SAMPLE_RECORDS) // ข้อมูลรายการ
    const [showActionModal, setShowActionModal] = useState(false) // แสดงหน้าต่างแก้ไข/ลบ
    const [popupDelete, setPopupDelete] = useState(false) // แสดงหน้าต่างลบ
    const [actionItem, setActionItem] = useState(null) // ข้อมูลรายการ
    const scaleAnim = useRef(new Animated.Value(0)).current // การขยายของ
    const listEntranceAnim = useRef(new Animated.Value(0)).current // แอนิเมชันรายการตอนเข้า

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
            ? records
            : records.filter((r) => r.type === filter)
    if (dateFilter) {
        filteredRecords = filteredRecords.filter((r) => r.date === dateFilter)
    }

    // เปิดหน้าต่างแก้ไข/ลบ
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

    // ปิดหน้าต่างแก้ไข/ลบ
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

    // แก้ไขรายการ
    const handleEdit = () => {
        closeAction()
        navigation.navigate("AddList", { editItem: actionItem })
    }

    // ลบรายการ
    const handleDelete = () => {
        if (actionItem) {
            setRecords((prev) => prev.filter((r) => r.id !== actionItem.id))
        }
        closeAction()
        setPopupDelete(false)
    }

    // แสดงหน้าต่างลบ
    const showPopupDelete = () => {
        setPopupDelete(true)
        setShowActionModal(false)
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            friction: 8,
            tension: 80,
        }).start()
    }

    // ปิดหน้าต่างลบ
    const closePopupDelete = () => {
        setPopupDelete(false)
    }

    // เลือกวันที่
    const onDatePickerChange = (event, selectedDate) => {
        if (Platform.OS === "android") setShowDatePicker(false)
        if (event.type === "set") {
            const next = selectedDate || pickerDate
            setPickerDate(next)
            setDateFilter(dateToYYYYMMDD(next))
        }
    }

    // เลือกวันที่
    const openDatePicker = () => {
        setPickerDate(dateFilter ? new Date(dateFilter + "T12:00:00") : new Date())
        setShowDatePicker(true)
    }

    // ล้างตัวกรองวันที่
    const clearDateFilter = () => {
        setDateFilter(null)
    }

    // ลิสต์ตัวกรอง
    function FilterChip({ item, filter, setFilter }) {
        const isActive = filter === item.id
        return (
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setFilter(item.id)}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
            >
                <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                    {item.label}
                </Text>
            </TouchableOpacity>
        )
    }

    // icon ตาม listType (เงินสด / เงินในบัญชี)
    function iconMoney(listType, isIncome) {
        const iconName = listType === "เงินสด" ? "cash" : "bank"
        return (
            <MaterialCommunityIcons
                name={iconName}
                size={24}
                color={isIncome ? COLORS.black : COLORS.white}
            />
        )
    }

    // รายการ พร้อมแอนิเมชันเหมือนหน้า Warn (เล่นครั้งเดียวตอนเข้า)
    function RecordRow({ item, index, entranceAnim, openAction }) {
        const isIncome = item.type === "income"
        const listType = item.listType || "ไม่ระบุ"

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
                        { borderLeftColor: isIncome ? COLORS.accent : COLORS.red },
                    ]}
                >
                    <View style={styles.listContent}>
                        <View style={styles.list_textHead}>
                            <Text style={[styles.textMoney, { color: isIncome ? COLORS.accent : COLORS.red }]}>
                                {formatAmount(item.amount, item.type)}
                            </Text>
                            <Text style={styles.textList}>{isIncome ? "รายรับ" : "รายจ่าย"}</Text>
                        </View>
                        <View style={styles.list_text}>
                            <Text style={styles.textAbout}>{formatDate(item.date)}</Text>
                            <Text style={styles.textGroup}>{item.category}</Text>
                        </View>
                        <Text style={styles.textAbout} numberOfLines={1}>{item.title}</Text>
                    </View>
                    <View style={[styles.listLogo, { backgroundColor: isIncome ? COLORS.accent : COLORS.red }]}>
                        {iconMoney(listType, isIncome)}
                    </View>
                </TouchableOpacity>
            </Animated.View>
        )
    }

    // หน้าต่างว่าง
    function EmptyState({ filter, dateFilter, setFilter, setDateFilter }) {
        return (
            <View style={styles.emptyState}>
                <View style={styles.emptyIconWrap}>
                    <Ionicons name="document-text-outline" size={48} color={COLORS.gray} />
                </View>
                <Text style={styles.emptyTitle}>ยังไม่มีรายการ</Text>
                <Text style={styles.emptySub}>
                    {filter === "all" && !dateFilter
                        ? "เพิ่มรายการแรกของคุณได้ที่หน้าหลัก"
                        : "ลองเปลี่ยนตัวกรองหรือวันที่"}
                </Text>
                {(filter !== "all" || dateFilter) && (
                    <TouchableOpacity
                        style={styles.emptyButton}
                        onPress={() => {
                            setFilter("all")
                            setDateFilter(null)
                        }}
                    >
                        <Text style={styles.emptyButtonText}>แสดงทั้งหมด</Text>
                    </TouchableOpacity>
                )}
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <Text style={styles.textHeader}>ประวัติ</Text>

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
                    style={[styles.filterChip, dateFilter && styles.filterChipActive]}
                >
                    <Ionicons
                        name="calendar-outline"
                        size={18}
                        color={dateFilter ? COLORS.black : COLORS.background_White}
                        style={{ marginRight: 6 }}
                    />
                    <Text style={[styles.filterChipText, dateFilter && styles.filterChipTextActive]}>
                        {dateFilter ? formatDate(dateFilter) : "เลือกวันที่"}
                    </Text>
                </TouchableOpacity>

                {/* Clear Date Filter */}
                {dateFilter && (
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={clearDateFilter}
                        style={styles.dateFilterClear}
                    >
                        <Entypo name="cross" size={18} color={COLORS.white} />
                        <Text style={styles.dateFilterClearText}>ล้าง</Text>
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
                        <Text style={styles.datePickerBtnText}>ยกเลิก</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => {
                            setDateFilter(dateToYYYYMMDD(pickerDate))
                            setShowDatePicker(false)
                        }}
                        style={[styles.datePickerBtn, styles.datePickerBtnConfirm]}
                    >
                        <Text style={[styles.datePickerBtnText, styles.datePickerBtnTextConfirm]}>ตกลง</Text>
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
                <View style={styles.modalOverlay}>
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
                            },
                        ]}
                    >
                        <TouchableOpacity
                            style={styles.modalClose}
                            onPress={closeAction}
                        >
                            <Entypo name="cross" size={24} color={COLORS.white} />
                        </TouchableOpacity>
                        <Text style={styles.actionModalTitle}>{actionItem.title}</Text>
                        <Text style={[styles.actionModalAmount, { color: actionItem.type === "income" ? COLORS.accent : COLORS.red }]}>
                            {formatAmount(actionItem.amount, actionItem.type)}
                        </Text>
                        <Text style={styles.actionModalMeta}>
                            รายการ : {actionItem.type === "income" ? "รายรับ" : "รายจ่าย"}
                        </Text>
                        <Text style={styles.actionModalMeta}>
                            ประเภท : {actionItem.listType}
                        </Text>
                        <Text style={styles.actionModalMeta}>
                            หมวดหมู่ : {actionItem.category}
                        </Text>
                        <Text style={[styles.actionModalMeta, { marginTop: 20, fontWeight: FONTS.bold }]}>
                            วันที่ : <Text style={{ fontWeight: FONTS.normal }}>{formatDate(actionItem.date)}</Text>
                        </Text>
                        <View style={styles.actionButtons}>
                            <TouchableOpacity style={styles.actionBtnEdit} onPress={handleEdit}>
                                <Ionicons name="pencil" size={20} color={COLORS.black} />
                                <Text style={styles.actionBtnEditText}>แก้ไข</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionBtnDelete} onPress={() => showPopupDelete()}>
                                <Ionicons name="trash-outline" size={20} color={COLORS.white} />
                                <Text style={styles.actionBtnDeleteText}>ลบ</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </View>
            )}

            {/* Popup Delete */}
            {popupDelete && (
                <View style={styles.modalOverlay}>
                    <TouchableOpacity
                        style={styles.modalBackdrop}
                        activeOpacity={1}
                        onPress={closePopupDelete}
                    />
                    <Animated.View
                        style={[
                            styles.actionModal,
                            {
                                transform: [{ scale: scaleAnim }],
                            },
                        ]}
                    >
                        <MaterialCommunityIcons name="delete" size={60} color={COLORS.red} style={{ textAlign: "center", marginBottom: 20, }} />
                        <Text style={styles.actionModalTitle}>ยืนยันการลบรายการ</Text>
                        <Text style={{ color: COLORS.gray, textAlign: "center", marginBottom: 20, }}>คุณต้องการลบรายการนี้จริงหรือไม่</Text>
                        <TouchableOpacity style={styles.actionBtnDelete} onPress={handleDelete}>
                            <Text style={styles.actionBtnDeleteText}>ลบ</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={closePopupDelete}>
                            <Text style={[styles.actionBtnDeleteText, { marginTop: 15 }]}>ยกเลิก</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: COLORS.black,
    },
    textHeader: {
        color: COLORS.white,
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
        backgroundColor: COLORS.red,
    },
    dateFilterClearText: {
        color: COLORS.white,
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
        backgroundColor: COLORS.accent,
        borderRadius: 20,
    },
    datePickerBtnText: {
        color: COLORS.background_White,
        fontSize: SIZES.sm,
        fontWeight: FONTS.semibold,
    },
    datePickerBtnTextConfirm: {
        color: COLORS.black,
    },
    filterChip: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 20,
        backgroundColor: COLORS.chart,
    },
    filterChipActive: {
        backgroundColor: COLORS.accent,
    },
    filterChipText: {
        color: COLORS.background_White,
        fontSize: SIZES.sm,
        fontWeight: FONTS.semibold,
    },
    filterChipTextActive: {
        color: COLORS.black,
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
        backgroundColor: COLORS.cardBg,
        borderRadius: 12,
        width: "100%",
        paddingVertical: 14,
        paddingLeft: 16,
        paddingRight: 14,
        borderLeftWidth: 5,
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
        color: COLORS.white,
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
        color: COLORS.background_White,
        fontSize: SIZES.xs,
        fontWeight: FONTS.regular,
        marginTop: 2,
    },
    textGroup: {
        color: COLORS.white,
        fontSize: SIZES.xs,
        fontWeight: FONTS.semibold,
    },
    listTypeChip: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        backgroundColor: COLORS.chart,
    },
    listTypeChipText: {
        color: COLORS.background_White,
        fontSize: 11,
        fontWeight: FONTS.semibold,
    },
    listLogo: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: "center",
        justifyContent: "center",
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
        backgroundColor: COLORS.chart,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
    },
    emptyTitle: {
        color: COLORS.white,
        fontSize: SIZES.base,
        fontWeight: FONTS.bold,
        marginBottom: 6,
    },
    emptySub: {
        color: COLORS.background_White,
        fontSize: SIZES.sm,
        textAlign: "center",
        marginBottom: 16,
    },
    emptyButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        backgroundColor: COLORS.accent,
    },
    emptyButtonText: {
        color: COLORS.black,
        fontSize: SIZES.sm,
        fontWeight: FONTS.bold,
    },
    modalOverlay: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 100,
    },
    modalBackdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.6)",
    },
    actionModal: {
        position: "absolute",
        left: 24,
        right: 24,
        top: "35%",
        backgroundColor: COLORS.cardBg,
        borderRadius: 16,
        padding: 24,
        borderWidth: 1,
        borderColor: COLORS.chart,
    },
    modalClose: {
        position: "absolute",
        right: 16,
        top: 16,
        zIndex: 1,
    },
    actionModalTitle: {
        color: COLORS.white,
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
        color: COLORS.background_White,
        fontSize: SIZES.xs,
        marginBottom: 5,
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
        backgroundColor: COLORS.accent,
    },
    actionBtnEditText: {
        color: COLORS.black,
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
        backgroundColor: COLORS.red,
    },
    actionBtnDeleteText: {
        color: COLORS.white,
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
