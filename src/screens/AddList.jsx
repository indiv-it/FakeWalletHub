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
} from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import { useState, useRef, useEffect } from "react"
import DateTimePicker from '@react-native-community/datetimepicker';
import { BlurView } from 'expo-blur';

// components
import { COLORS, SIZES, FONTS, CARD_SHADOW } from "../style/Theme"
import { useTheme } from "../context/ThemeContext"
import { useTransaction } from "../context/TransactionContext"
import { useLanguage } from "../context/LanguageContext"
import { useCategory } from "../context/CategoryContext"
import AlertPopup from "../components/AlertPopup";

// custom type button
const CustomTypeButton = ({ label, isActive, activeColor, activeTextColor, inactiveTextColor = COLORS.white, onPress }) => {
    const { colors } = useTheme()

    // animation value
    const animatedValue = useRef(new Animated.Value(isActive ? 1 : 0)).current;

    // animation button
    useEffect(() => {
        Animated.timing(animatedValue, {
            toValue: isActive ? 1 : 0,
            duration: 0,
            easing: Easing.out(Easing.ease),
            useNativeDriver: false,
        }).start();
    }, [isActive]);

    // animation background color
    const backgroundColor = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [colors.cardBg, activeColor]
    });

    // animation text color
    const textColor = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [inactiveTextColor, activeTextColor]
    });

    // return button
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

export default function AddList() {

    const navigation = useNavigation()
    const route = useRoute()
    const editItem = route.params?.editItem
    const isEditMode = !!editItem
    const { colors } = useTheme()
    const { addTransaction, editTransaction } = useTransaction()
    const { t, currentLang } = useLanguage()
    const { categories } = useCategory()

    const mappedType =
        editItem?.type === "income"
            ? t('income')
            : editItem?.type === "expense"
                ? t('expense')
                : t('expense')

    const mappedGroup = editItem?.category || categories.find(c=>c.id==='essentials')?.name || "เงินจำเป็น"
    const mappedAccountRaw = editItem?.listType || t('cash')
    const mappedAccount =
        mappedAccountRaw === "เงินในบัญชี" ? t('accountInBank') : mappedAccountRaw

    const initialDateTime =
        editItem && editItem.date
            ? new Date(editItem.date + "T00:00:00")
            : new Date()

    const [listType, setListType] = useState(mappedType);
    const [listGroup, setListGroup] = useState(mappedGroup);
    const [listAccount, setListAccount] = useState(mappedAccount);

    const [amount, setAmount] = useState(editItem ? String(editItem.amount ?? '') : '');
    const [title, setTitle] = useState(editItem?.title ?? '');

    // date
    const [dateTime, setDateTime] = useState(initialDateTime);
    const [date, setDate] = useState(initialDateTime.toLocaleDateString());
    // show date picker
    const [showDatePicker, setShowDatePicker] = useState(false);
    // popup alert
    const [showAmountAlert, setShowAmountAlert] = useState(false);
    const [showCompleteAlert, setShowCompleteAlert] = useState(false);

    // on date change
    const onDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || dateTime;
        setShowDatePicker(Platform.OS === 'ios');
        setDateTime(currentDate);
        setDate(currentDate.toLocaleDateString());
    };

    const handleSave = async () => {
        const numericAmount = parseFloat(String(amount).replace(/,/g, ''));

        if (!amount || isNaN(numericAmount) || numericAmount <= 0) {
            setShowAmountAlert(true);
            return;
        }

        if (!listType) {
            alert('กรุณาเลือกประเภทรายการ');
            return;
        }

        // Map type to English for database
        const curIncome = t('income');
        const curExpense = t('expense');

        const typeMapping = {
            [curIncome]: 'income',
            [curExpense]: 'expense',
        };

        const dateStr = `${dateTime.getFullYear()}-${String(dateTime.getMonth() + 1).padStart(2, '0')}-${String(dateTime.getDate()).padStart(2, '0')}`;

        const transactionData = {
            title,
            amount: numericAmount,
            type: typeMapping[listType] || 'expense',
            category: listGroup || 'ไม่ระบุหมวดหมู่',
            listType: listAccount || 'ไม่ระบุประเภทเงิน',
            date: dateStr,
            created_at: new Date().toISOString(),
        };

        try {
            if (isEditMode && editItem?.id) {
                await editTransaction(editItem.id, transactionData);
                setShowCompleteAlert(true);
            } else {
                await addTransaction(transactionData);
                setShowCompleteAlert(true);
            }
        } catch (error) {
            console.error('Error saving transaction:', error);
            alert('Error', 'เกิดข้อผิดพลาดในการบันทึกรายการ กรุณาลองใหม่');
        }
    };

    const clearForm = () => {
        setShowCompleteAlert(false);
        setTitle('');
        setAmount('');
        setListType('');
        setListGroup('');
        setListAccount('');
        setDateTime(new Date());
        navigation.navigate("Home");
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* header */}
            <Text style={[styles.textHeader, { color: colors.text }]}>{isEditMode ? t('editItem') : t('addItem')}</Text>

            {/* Form */}
            <View>
                {/* money */}
                <Text style={[styles.textForm, { color: colors.text }]}>{t('amount')}</Text>
                <TextInput
                    keyboardType="number-pad"
                    placeholder="00.00"
                    placeholderTextColor={colors.gray}
                    style={[styles.textInput, { color: colors.text, backgroundColor: colors.cardBg }]}
                    value={amount}
                    onChangeText={setAmount}
                />

                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={[styles.textForm, { color: colors.text }]}>{t('title')}</Text>
                    <Text style={[styles.textForm, { width: "30%", color: colors.text }]}>{t('date')}</Text>
                </View>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    {/* note */}
                    <TextInput
                        keyboardType="default"
                        placeholder="ชื่อรายการ"
                        placeholderTextColor={colors.gray}
                        style={[styles.textInput, { width: "63%", color: colors.text, backgroundColor: colors.cardBg }]}
                        value={title}
                        onChangeText={setTitle}
                    />

                    {/* date */}
                    <TouchableOpacity
                        onPress={() => setShowDatePicker(true)}
                        style={[styles.dateButton, { backgroundColor: colors.cardBg }]}
                    >
                        <Text style={[styles.dateText, { color: colors.text }]}>{date}</Text>
                    </TouchableOpacity>

                    {/* Date Picker */}
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

                {/* list type */}
                <Text style={[styles.textForm, { color: colors.text }]}>{t('listTypeTitle')}</Text>
                <View style={styles.typeContainer}>
                    <CustomTypeButton
                        label={t('income')}
                        isActive={listType === t('income')}
                        activeColor={colors.accent}
                        activeTextColor={colors.background}
                        inactiveTextColor={colors.text}
                        onPress={() => setListType(t('income'))}
                    />
                    <CustomTypeButton
                        label={t('expense')}
                        isActive={listType === t('expense')}
                        activeColor={colors.red}
                        activeTextColor={colors.white}
                        inactiveTextColor={colors.text}
                        onPress={() => setListType(t('expense'))}
                    />
                </View>

                {/* list account */}
                <Text style={[styles.textForm, { color: colors.text }]}>{t('accountTypeTitle')}</Text>
                <View style={styles.typeContainer}>
                    <CustomTypeButton
                        label={t('accountInBank')}
                        isActive={listAccount === t('accountInBank')}
                        activeColor={colors.accent}
                        activeTextColor={colors.background}
                        inactiveTextColor={colors.text}
                        onPress={() => setListAccount(listAccount === t('accountInBank') ? '' : t('accountInBank'))}
                    />
                    <CustomTypeButton
                        label={t('cash')}
                        isActive={listAccount === t('cash')}
                        activeColor={colors.accent}
                        activeTextColor={colors.background}
                        inactiveTextColor={colors.text}
                        onPress={() => setListAccount(listAccount === t('cash') ? '' : t('cash'))}
                    />
                </View>

                {/* list group */}
                <Text style={[styles.textForm, { color: colors.text }]}>{t('category')}</Text>
                <View style={styles.typeContainer}>
                    {categories.map((c) => (
                        <CustomTypeButton
                            key={c.id}
                            label={c.name}
                            isActive={listGroup === c.name}
                            activeColor={colors.accent}
                            activeTextColor={colors.background}
                            inactiveTextColor={colors.text}
                            onPress={() => setListGroup(listGroup === c.name ? '' : c.name)}
                        />
                    ))}
                </View>
            </View>

            {/* button */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity onPress={() => navigation.navigate("Home")} style={[styles.backButton, { backgroundColor: colors.background, borderColor: colors.accent }]}>
                    <Text style={[styles.textBack, { color: colors.accent }]}>{t('cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.backButton, { backgroundColor: colors.accent, borderColor: colors.accent }]}
                    onPress={handleSave}
                >
                    <Text style={[styles.textBack, { color: colors.background }]}>{t('save')}</Text>
                </TouchableOpacity>
            </View>

            <AlertPopup
                visible={showCompleteAlert}
                title={t('saveSuccess')}
                description={t('saveSuccessDesc')}
                onClose={clearForm}
                buttonText={t('ok')}
                type="success"
            />

            <AlertPopup
                visible={showAmountAlert}
                title={t('amountAlert')}
                description={t('amountAlertDesc')}
                onClose={() => setShowAmountAlert(false)}
                buttonText={t('ok')}
                type="warning"
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
        textAlign: "center",
        marginTop: 30,
        marginBottom: 10,
    },
    textForm: {
        fontSize: SIZES.sm,
        fontWeight: FONTS.normal,
        marginTop: 20,
    },
    textInput: {
        fontSize: SIZES.sm,
        fontWeight: FONTS.bold,
        paddingHorizontal: 20,
        height: 50,
        borderRadius: 15,
        marginTop: 10,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...CARD_SHADOW
    },
    typeContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 10,
    },
    dateButton: {
        height: 50,
        borderRadius: 15,
        marginTop: 10,
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
        width: 155,
        height: 50,
        borderRadius: 15,
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
        gap: 10,
        bottom: 54,
        left: 20,
        right: 20,
    },
    backButton: {
        width: 155,
        height: 50,
        borderRadius: 15,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
    },
    textBack: {
        fontSize: SIZES.sm,
        fontWeight: FONTS.bold,
    },
    alertOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)",

    },
    alertBackdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    alertBox: {
        width: "82%",
        borderRadius: 18,
        paddingVertical: 24,
        paddingHorizontal: 20,
        borderWidth: 1,
        alignItems: "center",
        borderColor: COLORS.border,
    },
    alertTitle: {
        fontSize: SIZES.base,
        fontWeight: FONTS.bold,
        marginBottom: 8,
    },
    alertMessage: {
        fontSize: SIZES.sm,
        textAlign: "center",
        marginBottom: 20,
        lineHeight: 20,
    },
    alertButton: {
        minWidth: 140,
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: 999,
        alignItems: "center",
        justifyContent: "center",
    },
    alertButtonText: {
        fontSize: SIZES.sm,
        fontWeight: FONTS.bold,
    },
})