import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Animated,
    Easing,
    Platform,
    Modal
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useState, useRef, useEffect } from "react";
import DateTimePicker from '@react-native-community/datetimepicker';
import { BlurView } from 'expo-blur';

// --- Utils & Theme ---
import { horizontalScale, verticalScale, moderateScale } from "../utils/responsive";
import { COLORS, SIZES, FONTS, CARD_SHADOW } from "../style/Theme";
import { useTheme } from "../context/ThemeContext";

// --- Contexts ---
import { useTransaction } from "../context/TransactionContext";
import { useLanguage } from "../context/LanguageContext";
import { useCategory } from "../context/CategoryContext";

// --- Constants & Components ---
import { LIST_TYPE_CASH, LIST_TYPE_BANK } from "../server/database";
import AlertPopup from "../components/AlertPopup";

/**
* CustomTypeButton Component (Internal)
* Render an animated button to select types/categories
*/
const CustomTypeButton = ({ label, isActive, activeColor, activeTextColor, inactiveTextColor = COLORS.white, onPress }) => {
    // --- Contexts ---
    const { colors } = useTheme();

    // --- Animation State ---
    const animatedValue = useRef(new Animated.Value(isActive ? 1 : 0)).current;

    // --- Animation Effect ---
    useEffect(() => {
        Animated.timing(animatedValue, {
            toValue: isActive ? 1 : 0,
            duration: 150,
            easing: Easing.out(Easing.ease),
            useNativeDriver: false,
        }).start();
    }, [isActive]);

    // --- Animated button colors background and text ---
    const backgroundColor = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [colors.cardBg, activeColor]
    });

    const textColor = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [inactiveTextColor, activeTextColor]
    });

    // --- Render Component ---
    return (
        <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
            <Animated.View style={[styles.typeButton, { backgroundColor }]}>
                <Animated.Text style={[styles.typeText, { color: textColor }]}>
                    {label}
                </Animated.Text>
            </Animated.View>
        </TouchableOpacity>
    );
};

/**
* AddList Screen Component
* Screen to add or edit a financial transaction.
*/
export default function AddList() {
    // --- Navigation & Route ---
    const navigation = useNavigation();
    const route = useRoute();

    // Evaluate if we are adding or editing an item
    const editItem = route.params?.editItem;
    const isEditMode = !!editItem;

    // --- Contexts ---
    const { colors } = useTheme();
    const { addTransaction, editTransaction } = useTransaction();
    const { t } = useLanguage();
    const { categories } = useCategory();

    // --- Initial Values Mapping ---
    const mappedType = editItem?.type || 'expense';
    const mappedGroup = editItem?.category !== undefined ? editItem.category : 'essentials';
    const mappedAccount = editItem?.listType !== undefined ? editItem.listType : LIST_TYPE_CASH;
    const initialDateTime = editItem && editItem.date
        ? new Date(editItem.date + "T00:00:00")
        : new Date();

    // --- Form State ---
    const [listType, setListType] = useState(mappedType);
    const [listGroup, setListGroup] = useState(mappedGroup);
    const [listAccount, setListAccount] = useState(mappedAccount);
    const [amount, setAmount] = useState(editItem ? String(editItem.amount ?? '') : '');
    const [title, setTitle] = useState(editItem?.title ?? '');

    // --- Date State ---
    const [dateTime, setDateTime] = useState(initialDateTime);
    const [date, setDate] = useState(initialDateTime.toLocaleDateString());
    const [showDatePicker, setShowDatePicker] = useState(false);

    // --- Popup State ---
    const [showAmountAlert, setShowAmountAlert] = useState(false);
    const [showCompleteAlert, setShowCompleteAlert] = useState(false);
    const [showTypeAlert, setShowTypeAlert] = useState(false);
    const [showSaveErrorAlert, setShowSaveErrorAlert] = useState(false);

    // --- Handlers ---

    /**
    * Handle Date Picker Change
    */
    const onDateChange = (selectedDate) => {
        const currentDate = selectedDate || dateTime;
        setShowDatePicker(Platform.OS === 'ios');
        setDateTime(currentDate);
        setDate(currentDate.toLocaleDateString());
    };

    /**
    * Handle Saving Transaction
    */
    const handleSave = async () => {
        // Sanitize and parse amount
        const numericAmount = parseFloat(String(amount).replace(/,/g, ''));

        // Validate amount
        if (!amount || isNaN(numericAmount) || numericAmount <= 0) {
            setShowAmountAlert(true);
            return;
        }

        // Validate type
        if (!listType) {
            setShowTypeAlert(true);
            return;
        }

        // Format Date to YYYY-MM-DD
        const dateStr = `${dateTime.getFullYear()}-${String(dateTime.getMonth() + 1).padStart(2, '0')}-${String(dateTime.getDate()).padStart(2, '0')
            }`;

        // Construct Transaction Data
        const transactionData = {
            title,
            amount: numericAmount,
            type: listType,
            category: listGroup,
            listType: listAccount,
            date: dateStr,
            created_at: new Date().toISOString(),
        };

        try {
            if (isEditMode && editItem?.id) {
                // Update existing record
                await editTransaction(editItem.id, transactionData);
                setShowCompleteAlert(true);
            } else {
                // Create new record
                await addTransaction(transactionData);
                setShowCompleteAlert(true);
            }
        } catch (error) {
            console.error('Error saving transaction:', error);
            setShowSaveErrorAlert(true);
        }
    };

    /**
    * Clear Form & Navigate Home
    */
    const clearForm = () => {
        setShowCompleteAlert(false);
        setTitle('');
        setAmount('');
        setListType('expense');
        setListGroup('essentials');
        setListAccount(LIST_TYPE_CASH);
        setDateTime(new Date());
        navigation.navigate("Home");
    };

    // --- Render ---
    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header Area */}
            <Text style={[styles.textHeader, { color: colors.text }]}>
                {isEditMode
                    ? t('editItem')
                    : t('addItem')
                }
            </Text>

            {/* Form Area */}
            <View>
                {/* 1. Amount Input */}
                <Text style={[styles.textForm, { color: colors.text }]}>
                    {t('amount')}
                </Text>
                <TextInput
                    keyboardType="number-pad"
                    placeholder="00.00"
                    placeholderTextColor={colors.gray}
                    value={amount}
                    onChangeText={setAmount}
                    style={[styles.textInput, {
                        color: colors.text,
                        backgroundColor: colors.cardBg
                    }]}
                />

                {/* 2. Title & Date Area */}
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={[styles.textForm, { color: colors.text }]}>
                        {t('title')}
                    </Text>
                    <Text style={[styles.textForm, { width: "30%", color: colors.text }]}>
                        {t('date')}
                    </Text>
                </View>

                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    {/* Title / Note Input */}
                    <TextInput
                        keyboardType="default"
                        placeholder={t('itemName')}
                        placeholderTextColor={colors.gray}
                        value={title}
                        onChangeText={setTitle}
                        style={[styles.textInput, {
                            width: "63%",
                            color: colors.text,
                            backgroundColor: colors.cardBg
                        }]}
                    />

                    {/* Date Picker Button */}
                    <TouchableOpacity
                        onPress={() => setShowDatePicker(true)}
                        style={[styles.dateButton, { backgroundColor: colors.cardBg }]}
                    >
                        <Text style={[styles.dateText, { color: colors.text }]}>
                            {date}
                        </Text>
                    </TouchableOpacity>

                    {/* iOS/Android Date Picker */}
                    {showDatePicker && (
                        <DateTimePicker
                            value={dateTime}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={onDateChange}
                            themeVariant="dark"
                        />
                    )}
                </View>

                {/* 3. Transaction Type Segment (Income vs Expense) */}
                <Text style={[styles.textForm, { color: colors.text }]}>
                    {t('listTypeTitle')}
                </Text>
                <View style={styles.typeContainer}>
                    <CustomTypeButton
                        label={t('income')}
                        isActive={listType === 'income'}
                        activeColor={colors.accent}
                        activeTextColor={colors.background}
                        inactiveTextColor={colors.text}
                        onPress={() => setListType('income')}
                    />

                    <CustomTypeButton
                        label={t('expense')}
                        isActive={listType === 'expense'}
                        activeColor={colors.red}
                        activeTextColor={colors.white}
                        inactiveTextColor={colors.text}
                        onPress={() => setListType('expense')}
                    />
                </View>

                {/* 4. Account Type Segment (Bank vs Cash) */}
                <Text style={[styles.textForm, { color: colors.text }]}>
                    {t('accountTypeTitle')}
                </Text>
                <View style={styles.typeContainer}>
                    <CustomTypeButton
                        label={t('accountInBank')}
                        isActive={listAccount === LIST_TYPE_BANK}
                        activeColor={colors.accent}
                        activeTextColor={colors.background}
                        inactiveTextColor={colors.text}
                        onPress={() => setListAccount(
                            listAccount === LIST_TYPE_BANK
                                ? 'ไม่ระบุ'
                                : LIST_TYPE_BANK)
                        }
                    />

                    <CustomTypeButton
                        label={t('cash')}
                        isActive={listAccount === LIST_TYPE_CASH}
                        activeColor={colors.accent}
                        activeTextColor={colors.background}
                        inactiveTextColor={colors.text}
                        onPress={() => setListAccount(
                            listAccount === LIST_TYPE_CASH
                                ? 'ไม่ระบุ'
                                : LIST_TYPE_CASH)
                        }
                    />
                </View>

                {/* 5. Category Selection Segment */}
                <Text style={[styles.textForm, { color: colors.text }]}>
                    {t('category')}
                </Text>
                <View style={styles.typeContainer}>
                    {categories.map((c) => (
                        <CustomTypeButton
                            key={c.id}
                            label={c.name}
                            isActive={listGroup === c.id}
                            activeColor={colors.accent}
                            activeTextColor={colors.background}
                            inactiveTextColor={colors.text}
                            onPress={() => setListGroup(
                                listGroup === c.id
                                    ? 'ไม่ระบุ'
                                    : c.id)
                            }
                        />
                    ))}
                </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    onPress={() => navigation.navigate("Home")}
                    style={[styles.backButton, { backgroundColor: colors.background, borderColor: colors.accent }]}
                >
                    <Text style={[styles.textBack, { color: colors.accent }]}>
                        {t('cancel')}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.backButton, { backgroundColor: colors.accent, borderColor: colors.accent }]}
                    onPress={handleSave}
                >
                    <Text style={[styles.textBack, { color: colors.background }]}>
                        {t('save')}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Popup Alerts */}
            <Modal 
                visible={showCompleteAlert} 
                transparent 
                animationType="fade"
                onRequestClose={() => setShowCompleteAlert(false)}
            >
                <BlurView
                    intensity={5}
                    tint="dark"
                    style={styles.blurView}
                >
                    {showCompleteAlert && (
                        <AlertPopup
                            visible={showCompleteAlert}
                            title={t('saveSuccess')}
                            description={t('saveSuccessDesc')}
                            onClose={clearForm}
                            buttonText={t('ok')}
                            type="success"
                        />
                    )}
                </BlurView>
            </Modal>

            {showAmountAlert && (
                <AlertPopup
                    visible={showAmountAlert}
                    title={t('amountAlert')}
                    description={t('amountAlertDesc')}
                    onClose={() => setShowAmountAlert(false)}
                    buttonText={t('ok')}
                    type="warning"
                />
            )}

            {showTypeAlert && (
                <AlertPopup
                    visible={showTypeAlert}
                    title={t('selectListType')}
                    description={t('selectListType')}
                    onClose={() => setShowTypeAlert(false)}
                    buttonText={t('ok')}
                    type="warning"
                />
            )}

            {showSaveErrorAlert && (
                <AlertPopup
                    visible={showSaveErrorAlert}
                    title={t('saveError')}
                    description={t('saveError')}
                    onClose={() => setShowSaveErrorAlert(false)}
                    buttonText={t('ok')}
                    type="error"
                />
            )}
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
        textAlign: "center",
        marginTop: verticalScale(30),
        marginBottom: verticalScale(10),
    },
    textForm: {
        fontSize: SIZES.sm,
        fontWeight: FONTS.normal,
        marginTop: verticalScale(20),
    },
    blurView: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    textInput: {
        fontSize: SIZES.sm,
        fontWeight: FONTS.bold,
        paddingHorizontal: horizontalScale(20),
        height: verticalScale(50),
        borderRadius: moderateScale(15),
        marginTop: verticalScale(10),
        borderWidth: 1,
        borderColor: COLORS.border,
        ...CARD_SHADOW
    },
    typeContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: horizontalScale(10),
        justifyContent: "center",
        alignItems: "center",
        marginTop: verticalScale(10),
    },
    dateButton: {
        height: verticalScale(50),
        borderRadius: moderateScale(15),
        marginTop: verticalScale(10),
        width: "33%",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: COLORS.border,
        ...CARD_SHADOW
    },
    dateText: {
        fontSize: SIZES.sm,
        fontWeight: FONTS.bold,
    },
    typeButton: {
        width: horizontalScale(155),
        height: verticalScale(50),
        borderRadius: moderateScale(15),
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: COLORS.border,
        ...CARD_SHADOW
    },
    typeText: {
        fontSize: SIZES.sm,
        fontWeight: FONTS.bold,
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        position: "absolute",
        gap: horizontalScale(10),
        bottom: verticalScale(54),
        left: horizontalScale(20),
        right: horizontalScale(20),
    },
    backButton: {
        width: horizontalScale(155),
        height: verticalScale(50),
        borderRadius: moderateScale(15),
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
    },
    textBack: {
        fontSize: SIZES.sm,
        fontWeight: FONTS.bold,
    },
});