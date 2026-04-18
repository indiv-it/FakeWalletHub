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
    TextInput
} from "react-native";
import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { BlurView } from 'expo-blur';
import { horizontalScale, verticalScale, moderateScale } from '../utils/responsive';

// --- Theme & Components ---
import { SIZES, FONTS, CARD_SHADOW, COLORS } from "../style/Theme";
import { useTheme } from "../context/ThemeContext";
import ConfirmPopup from "../components/ConfirmPopup";
import Footer from "../components/Footer";

// --- Contexts ---
import { useTransaction } from "../context/TransactionContext";
import { useLanguage } from "../context/LanguageContext";
import { useCurrency } from "../context/CurrencyContext";
import { useCategory } from "../context/CategoryContext";

// --- Constants & Database ---
import { LIST_TYPE_CASH, LIST_TYPE_BANK } from "../server/database";

// --- Icons ---
import {
    Landmark,
    Banknote,
    X,
    CalendarDays,
    Trash2,
    Pencil,
    Scroll,
    Archive,
    ArrowUp,
    Search,
    TrendingUp,
    TrendingDown,
    FunnelX,
    ClipboardList
} from 'lucide-react-native';

/**
* Record Screen Component
* Displays a list of transaction records with filtering by type (All, Income, Expense)
* and by date. Allows users to view, edit, and delete transactions.
*/
export default function Record() {
    // --- Navigation ---
    const navigation = useNavigation();

    // --- Context Hooks ---
    const { colors } = useTheme();
    const { transactions, loadTransactions, removeTransaction } = useTransaction();
    const { t, formatDateByLang } = useLanguage();
    const { formatMoney } = useCurrency();
    const { getCategoryDisplayName } = useCategory();

    // --- State: Filtering ---
    const [filter, setFilter] = useState("all");
    const [dateFilter, setDateFilter] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    // --- State: Date Picker ---
    const [pickerDate, setPickerDate] = useState(() => new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    // --- State: Modals & Popups ---
    const [showActionModal, setShowActionModal] = useState(false);
    const [popupDelete, setPopupDelete] = useState(false);
    const [actionItem, setActionItem] = useState(null);
    const [transactionToDelete, setTransactionToDelete] = useState(null);
    const [showBackToTop, setShowBackToTop] = useState(false);

    // --- Animation Refs ---
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const listEntranceAnim = useRef(new Animated.Value(0)).current;
    const flatListRef = useRef(null);

    // --- Constants ---
    const FILTERS = [
        {
            id: "all",
            label: t('all'),
            icon: <FunnelX size={16} color={filter === "all" ? colors.background : colors.text} />
        },
        {
            id: "income",
            label: t('income'),
            icon: <TrendingUp size={16} color={filter === "income" ? colors.background : colors.text} />
        },
        {
            id: "expense",
            label: t('expense'),
            icon: <TrendingDown size={16} color={filter === "expense" ? colors.background : colors.text} />
        },
    ];

    // --- Lifecycle Methods ---

    // Reload transaction data when the screen comes into focus
    useFocusEffect(
        useCallback(() => {
            loadTransactions();
        }, [loadTransactions])
    );

    // Initial entrance animation
    useEffect(() => {
        Animated.timing(listEntranceAnim, {
            toValue: 1,
            duration: 400,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
        }).start();
    }, []);

    // --- Derived State & Computations ---

    // Filter records based on transaction type, date, and search query
    let filteredRecords =
        filter === "all"
            ? transactions
            : transactions.filter((r) => r.type === filter);
    if (dateFilter) {
        filteredRecords = filteredRecords.filter((r) => r.date === dateFilter);
    }
    if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filteredRecords = filteredRecords.filter((r) =>
            r.title.toLowerCase().includes(query) ||
            (r.title === 'Untitled' && t('anonymous').toLowerCase().includes(query))
        );
    }

    /**
    * Format amount with sign based on transaction type
    */
    const formatAmount = (amount, type) => {
        const sign = type === "income" ? "+" : "-";
        return `${sign} ${formatMoney(amount)}`;
    };

    /**
    * Get display name for list type constants (Cash vs Bank)
    */
    const getListTypeDisplay = (listType) => {
        if (listType === LIST_TYPE_CASH) return t('cash');
        if (listType === LIST_TYPE_BANK) return t('accountInBank');
        return listType;
    };

    /**
    * Convert JS Date object to YYYY-MM-DD
    */
    const dateToYYYYMMDD = (date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const d = String(date.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
    };

    // --- Handlers: Item Actions ---

    /**
    * Open action modal for a specific transaction
    */
    const openAction = (item) => {
        setActionItem(item);
        setShowActionModal(true);
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            friction: 8,
            tension: 80,
        }).start();
    };

    /**
    * Close action modal
    */
    const closeAction = () => {
        Animated.timing(scaleAnim, {
            toValue: 0,
            duration: 150,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
        }).start(() => {
            setShowActionModal(false);
            setActionItem(null);
        });
    };

    /**
    * Navigate to edit screen
    */
    const handleEdit = () => {
        closeAction();
        navigation.navigate("AddList", { editItem: actionItem });
    };

    /**
    * Delete process triggers
    */
    const handleDeleteClick = (item) => {
        setTransactionToDelete(item);
        setPopupDelete(true);
    };

    // Show delete popup
    const showPopupDelete = () => {
        handleDeleteClick(actionItem);
        setShowActionModal(false);
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            friction: 8,
            tension: 80,
        }).start();
    };

    // Confirm delete
    const confirmDelete = async () => {
        if (transactionToDelete) {
            await removeTransaction(transactionToDelete.id);
            setTransactionToDelete(null);
            setPopupDelete(false);
        }
    };

    // Handle delete
    const handleDelete = async () => {
        if (actionItem) {
            await removeTransaction(actionItem.id);
        }
        setPopupDelete(false);
        setActionItem(null);
    };

    // --- Handlers: Date Picker ---

    // Handle date picker change
    const onDatePickerChange = (event, selectedDate) => {
        if (Platform.OS === "android") setShowDatePicker(false);
        if (event.type === "set") {
            const next = selectedDate || pickerDate;
            setPickerDate(next);
            setDateFilter(dateToYYYYMMDD(next));
        }
    };

    // Open date picker
    const openDatePicker = () => {
        setPickerDate(dateFilter ? new Date(dateFilter + "T12:00:00") : new Date());
        setShowDatePicker(true);
    };

    // Clear date filter
    const clearDateFilter = () => {
        setDateFilter(null);
    };

    // Handle scroll to show/hide back to top button
    const handleScroll = ({ nativeEvent }) => {
        const offsetY = nativeEvent.contentOffset.y;
        setShowBackToTop(offsetY > 200);
    };

    // Scroll to top
    const scrollToTop = () => {
        if (flatListRef.current) {
            flatListRef.current.scrollToOffset({ offset: 0, animated: true });
        }
    };

    // --- Sub-components ---

    /**
    * Component for individual filter chips
    */
    function FilterChip({ item, filter, setFilter }) {
        const isActive = filter === item.id;
        return (
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setFilter(item.id)}
                style={[styles.filterChip, {
                    backgroundColor: isActive
                        ? colors.accent
                        : colors.cardBg
                }]}
            >
                {item.icon}
                <Text style={[styles.filterChipText, {
                    color: isActive
                        ? colors.background
                        : colors.text
                }]}>
                    {item.label}
                </Text>
            </TouchableOpacity>
        );
    }

    /**
    * Helper to render the appropriate icon based on account type
    */
    function iconMoney(listType, isIncome) {
        return (
            listType === LIST_TYPE_CASH
                ? <Banknote size={24} color={isIncome ? colors.accent : colors.red} />
                : listType === LIST_TYPE_BANK
                    ? <Landmark size={24} color={isIncome ? colors.accent : colors.red} />
                    : <Archive size={24} color={isIncome ? colors.accent : colors.red} />
        );
    }

    /**
    * Individual record row component with entry animations
    */
    function RecordRow({ item, index, entranceAnim, openAction }) {
        const isIncome = item.type === "income";
        const listType = item.listType || LIST_TYPE_CASH;

        // Animation for entry
        const opacity = entranceAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
        });

        // Animation for entry
        const translateY = entranceAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [20 + index * 4, 0],
        });

        return (
            <Animated.View style={{ opacity, transform: [{ translateY }] }}>
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => openAction(item)}
                    style={[styles.listbox, {
                        backgroundColor: colors.cardBg,
                        borderLeftColor: isIncome
                            ? colors.accent
                            : colors.red
                    }]
                    }
                >
                    <View style={styles.listContent}>
                        <View style={styles.list_textHead}>
                            {/* Amount */}
                            <Text style={[styles.textMoney, {
                                color: isIncome
                                    ? colors.accent
                                    : colors.red
                            }]}>
                                {formatAmount(item.amount, item.type)}
                            </Text>

                            {/* Type */}
                            <Text style={[styles.textList, { color: colors.text }]}>
                                {isIncome ? t('income') : t('expense')}
                            </Text>
                        </View>

                        <View style={styles.list_text}>
                            {/* Date */}
                            <Text style={[styles.textAbout, { color: colors.gray }]}>
                                {formatDateByLang(item.date)}
                            </Text>

                            {/* Category */}
                            <Text style={[styles.textGroup, { color: colors.gray }]}>
                                {getCategoryDisplayName(item.category)}
                            </Text>
                        </View>

                        {/* Title */}
                        <Text
                            numberOfLines={1}
                            style={[styles.textAbout, { color: colors.text }]}
                        >
                            {item.title !== 'Untitled'
                                ? item.title
                                : t('anonymous')}
                        </Text>
                    </View>

                    {/* Icon */}
                    <View style={[styles.listLogo, {
                        backgroundColor: isIncome ? colors.accent + '50' : "#ff000040",
                        borderColor: isIncome ? colors.accent + '60' : "#ff000050"
                    }]}>
                        {iconMoney(listType, isIncome)}
                    </View>
                </TouchableOpacity>
            </Animated.View>
        );
    }

    /**
    * Component to show when no transactions match the filters
    */
    function EmptyState({ filter, dateFilter, setFilter, setDateFilter }) {
        return (
            <View style={styles.emptyState}>
                {/* Icon */}
                <View style={[styles.emptyIconWrap, { backgroundColor: colors.chart }]}>
                    <Scroll size={48} color={colors.text} />
                </View>

                {/* Title */}
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                    {t('noTransaction')}
                </Text>

                {/* Subtitle */}
                <Text style={[styles.emptySub, { color: colors.gray }]}>
                    {filter === "all" && !dateFilter
                        ? t('add')
                        : t('noTransaction')
                    }
                </Text>

                {/* Button to reset filters */}
                {(filter !== "all" || dateFilter) && (
                    <TouchableOpacity
                        style={[styles.emptyButton, { backgroundColor: colors.accent }]}
                        onPress={() => {
                            setFilter("all");
                            setDateFilter(null);
                        }}
                    >
                        <Text style={[styles.emptyButtonText, { color: colors.background }]}>
                            {t('all')}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    }

    // --- Main Render ---
    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: horizontalScale(10) }}>
                <ClipboardList size={20} color={colors.accent} />
                <Text style={[styles.textHeader, { color: colors.text }]}>
                    {t('record')}
                </Text>
            </View>

            {/* Sub-section: Filters */}
            <View style={styles.filterRow}>
                {FILTERS.map((f) => (
                    <FilterChip
                        key={f.id}
                        item={f}
                        filter={filter}
                        setFilter={setFilter}
                        icon={f.icon}
                    />
                ))}
            </View>

            {/* Sub-section: Date Filter */}
            <View style={styles.dateFilterRow}>
                <View style={[styles.searchContainer, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                    <Search size={18} color={colors.gray} />
                    <TextInput
                        placeholder={t('search')}
                        placeholderTextColor={colors.gray}
                        style={[styles.searchInput, { color: colors.text }]}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={openDatePicker}
                    style={[styles.filterChip, {
                        backgroundColor: dateFilter
                            ? colors.accent
                            : colors.cardBg
                    }]}
                >
                    {/* Calendar Icon */}
                    <CalendarDays
                        size={18}
                        style={{ marginRight: 6 }}
                        color={dateFilter
                            ? colors.background
                            : colors.text
                        }
                    />

                    {/* Date Text */}
                    <Text style={[styles.filterChipText, { color: dateFilter ? colors.background : colors.text }]}>
                        {dateFilter
                            ? formatDateByLang(dateFilter)
                            : t('date')
                        }
                    </Text>
                    {/* Clear Date Filter Button */}
                    {dateFilter && (
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={clearDateFilter}
                            style={styles.dateFilterClear}
                        >
                            <X size={18} color={colors.background} />
                        </TouchableOpacity>
                    )}
                </TouchableOpacity>

            </View>

            {/* Component: Date Picker Modal */}
            {showDatePicker && (
                <DateTimePicker
                    value={pickerDate}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={onDatePickerChange}
                    onTouchCancel={() => Platform.OS === "ios" && setShowDatePicker(false)}
                />
            )}

            {/* Sub-section: iOS Date Picker Confirm/Cancel Layout */}
            {Platform.OS === "ios" && showDatePicker && (
                <View style={styles.datePickerActions}>

                    {/* Cancel Button */}
                    <TouchableOpacity
                        onPress={() => setShowDatePicker(false)}
                        style={styles.datePickerBtn}
                    >
                        <Text style={styles.datePickerBtnText}>
                            {t('cancel')}
                        </Text>
                    </TouchableOpacity>

                    {/* Confirm Button */}
                    <TouchableOpacity
                        onPress={() => {
                            setDateFilter(dateToYYYYMMDD(pickerDate));
                            setShowDatePicker(false);
                        }}
                        style={[
                            styles.datePickerBtn,
                            styles.datePickerBtnConfirm
                        ]}
                    >
                        <Text style={[styles.datePickerBtnText]}>
                            {t('ok')}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Sub-section: Transaction List */}
            <Animated.View style={styles.listContainer}>
                <FlatList
                    ref={flatListRef}
                    data={filteredRecords}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item, index }) => (
                        <RecordRow
                            item={item}
                            index={index}
                            entranceAnim={listEntranceAnim}
                            openAction={openAction}
                        />
                    )}
                    contentContainerStyle={[
                        styles.listContentContainer,
                        filteredRecords.length === 0 && styles.listContentEmpty,
                    ]}
                    ListEmptyComponent={
                        <EmptyState
                            filter={filter}
                            dateFilter={dateFilter}
                            setFilter={setFilter}
                            setDateFilter={setDateFilter}
                        />
                    }
                    showsVerticalScrollIndicator={false}
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                />
            </Animated.View>

            {/* Back to Top Button */}
            {showBackToTop && (
                <TouchableOpacity
                    style={[styles.backToTopButton, { backgroundColor: colors.accent }]}
                    onPress={scrollToTop}
                    activeOpacity={0.8}
                >
                    <ArrowUp size={24} color={colors.background} />
                </TouchableOpacity>
            )}

            {/* Bottom Footer Area */}
            <Footer />

            {/* Modals & Popups: Item Action Sheet */}
            {showActionModal && actionItem && (
                <Modal
                    visible={showActionModal}
                    transparent={true}
                    animationType="fade"
                >
                    <BlurView
                        intensity={30}
                        tint="dark"
                        style={styles.modalOverlay}
                    >
                        <TouchableOpacity
                            style={styles.modalBackdrop}
                            activeOpacity={1}
                            onPress={closeAction}
                        />
                        <Animated.View
                            style={[styles.actionModal, {
                                transform: [{ scale: scaleAnim }],
                                backgroundColor: colors.cardBg
                            }
                            ]}
                        >
                            {/* Close Button */}
                            <TouchableOpacity
                                style={styles.modalClose}
                                onPress={closeAction}
                            >
                                <X size={24} color={colors.text} />
                            </TouchableOpacity>

                            {/* Title */}
                            <Text style={[styles.actionModalTitle, { color: colors.text, marginBottom: 15 }]}>
                                {actionItem.title !== 'Untitled'
                                    ? actionItem.title
                                    : t('anonymous')
                                }
                            </Text>

                            {/* Amount */}
                            <Text style={[styles.actionModalAmount, {
                                color: actionItem.type === "income"
                                    ? colors.accent
                                    : colors.red
                            }]}>
                                {formatAmount(actionItem.amount, actionItem.type)}
                            </Text>

                            {/* Type */}
                            <Text style={[styles.actionModalMeta, { color: colors.text }]}>
                                {t('title')}
                                : <Text style={{ fontWeight: FONTS.normal }}>
                                    {actionItem.type === "income"
                                        ? t('income')
                                        : t('expense')
                                    }
                                </Text>
                            </Text>

                            {/* List Type */}
                            <Text style={[styles.actionModalMeta, { color: colors.text }]}>
                                {t('listTypeTitle')}
                                : <Text style={{ fontWeight: FONTS.normal }}>
                                    {actionItem.listType === 'ไม่ระบุ'
                                        ? t('notSpecified')
                                        : getListTypeDisplay(actionItem.listType)
                                    }
                                </Text>
                            </Text>

                            {/* Category */}
                            <Text style={[styles.actionModalMeta, { color: colors.text }]}>
                                {t('category')}
                                : <Text style={{ fontWeight: FONTS.normal }}>
                                    {actionItem.category === 'ไม่ระบุ'
                                        ? t('notSpecified')
                                        : getCategoryDisplayName(actionItem.category)
                                    }
                                </Text>
                            </Text>

                            {/* Date */}
                            <Text style={[styles.actionModalMeta, { marginTop: 20, fontWeight: FONTS.bold, color: colors.text }]}>
                                {t('date')}
                                : <Text style={{ fontWeight: FONTS.normal }}>
                                    {formatDateByLang(actionItem.date)}
                                </Text>
                            </Text>

                            <View style={styles.actionButtons}>
                                {/* Edit Button */}
                                <TouchableOpacity
                                    style={[styles.actionBtnEdit, { backgroundColor: colors.accent }]}
                                    onPress={handleEdit}
                                    activeOpacity={0.8}
                                >
                                    <Pencil size={20} color={colors.background} />
                                    <Text style={[styles.actionBtnEditText, { color: colors.background }]}>
                                        {t('edit')}
                                    </Text>
                                </TouchableOpacity>

                                {/* Delete Button */}
                                <TouchableOpacity
                                    style={[styles.actionBtnDelete, { backgroundColor: colors.red }]}
                                    onPress={showPopupDelete}
                                    activeOpacity={0.8}
                                >
                                    <Trash2 size={20} color={colors.white} />
                                    <Text style={[styles.actionBtnDeleteText, { color: colors.white }]}>
                                        {t('delete')}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                    </BlurView>
                </Modal>
            )}

            {/* Modals & Popups: Shared Confirm */}
            <ConfirmPopup
                visible={popupDelete}
                onCancel={() => setPopupDelete(false)}
                onConfirm={confirmDelete}
            />
        </View>
    );
}

// --- Styles ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: horizontalScale(20),
    },
    textHeader: {
        fontSize: SIZES.xl,
        fontWeight: FONTS.bold,
        marginVertical: verticalScale(30),
        textAlign: "center",
    },
    filterRow: {
        flexDirection: "row",
        gap: horizontalScale(10),
        marginBottom: verticalScale(12),
    },
    dateFilterRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: horizontalScale(10),
        marginBottom: verticalScale(20),
    },
    dateFilterClear: {
        flexDirection: "row",
        alignItems: "center",
        gap: horizontalScale(4),
        paddingHorizontal: horizontalScale(4),
        borderRadius: moderateScale(20),
    },
    dateFilterClearText: {
        fontSize: SIZES.xs,
        fontWeight: FONTS.semibold,
    },
    datePickerActions: {
        flexDirection: "row",
        justifyContent: "flex-end",
        gap: horizontalScale(12),
        paddingHorizontal: horizontalScale(4),
        paddingVertical: verticalScale(8),
        marginBottom: verticalScale(8),
    },
    datePickerBtn: {
        paddingVertical: verticalScale(8),
        paddingHorizontal: horizontalScale(16),
    },
    datePickerBtnConfirm: {
        borderRadius: moderateScale(20),
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
        gap: horizontalScale(8),
        paddingVertical: verticalScale(10),
        paddingHorizontal: horizontalScale(18),
        borderRadius: moderateScale(20),
        borderWidth: 1,
        borderColor: COLORS.border,
        ...CARD_SHADOW
    },
    filterChipText: {
        fontSize: SIZES.xs,
        fontWeight: FONTS.semibold,
    },
    listContentContainer: {
        paddingBottom: verticalScale(100),
        gap: verticalScale(12),
    },
    listContentEmpty: {
        flexGrow: 1,
    },
    listbox: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderRadius: moderateScale(12),
        width: "100%",
        paddingVertical: verticalScale(14),
        paddingLeft: horizontalScale(16),
        paddingRight: horizontalScale(14),
        borderLeftWidth: horizontalScale(5),
        borderWidth: 1,
        borderColor: COLORS.border,
        ...CARD_SHADOW,
    },
    listContent: {
        flex: 1,
        marginRight: horizontalScale(12),
    },
    list_textHead: {
        flexDirection: "row",
        alignItems: "center",
        flexWrap: "wrap",
        gap: horizontalScale(8),
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
        gap: horizontalScale(10),
        marginTop: verticalScale(4),
    },
    textAbout: {
        fontSize: SIZES.xs,
        fontWeight: FONTS.regular,
        marginTop: verticalScale(2),
    },
    textGroup: {
        fontSize: SIZES.xs,
        fontWeight: FONTS.semibold,
    },
    listLogo: {
        width: horizontalScale(50),
        height: horizontalScale(50),
        borderRadius: moderateScale(25),
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
    },
    emptyState: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: verticalScale(60),
    },
    emptyIconWrap: {
        width: horizontalScale(88),
        height: horizontalScale(88),
        borderRadius: moderateScale(44),
        alignItems: "center",
        justifyContent: "center",
        marginBottom: verticalScale(16),
    },
    emptyTitle: {
        fontSize: SIZES.base,
        fontWeight: FONTS.bold,
        marginBottom: verticalScale(6),
    },
    emptySub: {
        fontSize: SIZES.sm,
        textAlign: "center",
        marginBottom: verticalScale(16),
    },
    emptyButton: {
        paddingVertical: verticalScale(10),
        paddingHorizontal: horizontalScale(20),
        borderRadius: moderateScale(20),
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
        backgroundColor: "rgba(0,0,0,0.8)",
        zIndex: 1,
    },
    actionModal: {
        position: "absolute",
        left: horizontalScale(24),
        right: horizontalScale(24),
        top: "35%",
        borderRadius: moderateScale(16),
        padding: horizontalScale(24),
        borderWidth: 1,
        borderColor: COLORS.border,
        zIndex: 2,
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: verticalScale(2),
        },
        shadowOpacity: 0.25,
        shadowRadius: moderateScale(3.84),
    },
    modalClose: {
        position: "absolute",
        right: horizontalScale(16),
        top: verticalScale(16),
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
        marginBottom: verticalScale(4),
    },
    actionModalMeta: {
        fontSize: SIZES.xs,
        marginBottom: verticalScale(5),
        fontWeight: FONTS.bold,
    },
    actionButtons: {
        flexDirection: "row",
        gap: horizontalScale(12),
        marginTop: verticalScale(20),
    },
    actionBtnEdit: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: horizontalScale(8),
        paddingVertical: verticalScale(14),
        borderRadius: moderateScale(12),
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
        gap: horizontalScale(8),
        paddingVertical: verticalScale(14),
        borderRadius: moderateScale(12),
        zIndex: 3,
        elevation: 3,
    },
    actionBtnDeleteText: {
        fontSize: SIZES.sm,
        fontWeight: FONTS.bold,
        textAlign: "center",
    },
    listContainer: {
        flex: 1,
        borderRadius: moderateScale(10),
        overflow: "hidden",
        minHeight: 280,
        maxHeight: "59%",
    },
    backToTopButton: {
        position: "absolute",
        bottom: verticalScale(120),
        right: horizontalScale(0),
        transform: [{ translateX: -horizontalScale(25) }],
        width: horizontalScale(50),
        height: horizontalScale(50),
        borderRadius: moderateScale(25),
        alignItems: "center",
        justifyContent: "center",
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: verticalScale(2),
        },
        shadowOpacity: 0.25,
        shadowRadius: moderateScale(3.84),
        zIndex: 100,
    },
    searchContainer: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        height: verticalScale(42),
        paddingHorizontal: horizontalScale(16),
        borderRadius: moderateScale(50),
        borderWidth: 1,
        ...CARD_SHADOW,
    },
    searchInput: {
        flex: 1,
        fontSize: SIZES.xs,
        fontWeight: FONTS.semibold,
        marginLeft: horizontalScale(8),
        outlineStyle: "none",
    },
});
