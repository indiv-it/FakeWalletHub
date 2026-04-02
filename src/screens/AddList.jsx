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
import { horizontalScale, verticalScale, moderateScale } from "../utils/responsive";

// components
import { COLORS, SIZES, FONTS, CARD_SHADOW } from "../style/Theme"
import { useTheme } from "../context/ThemeContext"
import { useTransaction } from "../context/TransactionContext"
import { useLanguage } from "../context/LanguageContext"
import { useCategory } from "../context/CategoryContext"
import { LIST_TYPE_CASH, LIST_TYPE_BANK } from "../server/database"
import AlertPopup from "../components/AlertPopup";

// custom type button
const CustomTypeButton = ({ label, isActive, activeColor, activeTextColor, inactiveTextColor = COLORS.white, onPress }) => {
    const { colors } = useTheme()

    const animatedValue = useRef(new Animated.Value(isActive ? 1 : 0)).current;

    useEffect(() => {
        Animated.timing(animatedValue, {
            toValue: isActive ? 1 : 0,
            duration: 0,
            easing: Easing.out(Easing.ease),
            useNativeDriver: false,
        }).start();
    }, [isActive]);

    const backgroundColor = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [colors.cardBg, activeColor]
    });

    const textColor = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [inactiveTextColor, activeTextColor]
    });

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
    const { t } = useLanguage()
    const { categories, resolveCategoryId } = useCategory()

    // Map edit item type to internal keys
    const mappedType = editItem?.type || 'expense';

    // Map edit item category (could be legacy name or ID)
    const mappedGroup = editItem?.category 
        ? resolveCategoryId(editItem.category) 
        : 'essentials';

    // Map edit item listType (could be legacy name or constant)
    const mappedAccount = editItem?.listType || LIST_TYPE_CASH;

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
    const [showTypeAlert, setShowTypeAlert] = useState(false);
    const [showSaveErrorAlert, setShowSaveErrorAlert] = useState(false);

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
            setShowTypeAlert(true);
            return;
        }

        const dateStr = `${dateTime.getFullYear()}-${String(dateTime.getMonth() + 1).padStart(2, '0')}-${String(dateTime.getDate()).padStart(2, '0')}`;

        const transactionData = {
            title,
            amount: numericAmount,
            type: listType, // 'income' or 'expense'
            category: listGroup || 'essentials', // category ID
            listType: listAccount || LIST_TYPE_CASH, // constant key
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
            setShowSaveErrorAlert(true);
        }
    };

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
                        placeholder={t('itemName')}
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

                {/* list type — income/expense */}
                <Text style={[styles.textForm, { color: colors.text }]}>{t('listTypeTitle')}</Text>
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

                {/* list account — cash/bank */}
                <Text style={[styles.textForm, { color: colors.text }]}>{t('accountTypeTitle')}</Text>
                <View style={styles.typeContainer}>
                    <CustomTypeButton
                        label={t('accountInBank')}
                        isActive={listAccount === LIST_TYPE_BANK}
                        activeColor={colors.accent}
                        activeTextColor={colors.background}
                        inactiveTextColor={colors.text}
                        onPress={() => setListAccount(listAccount === LIST_TYPE_BANK ? '' : LIST_TYPE_BANK)}
                    />
                    <CustomTypeButton
                        label={t('cash')}
                        isActive={listAccount === LIST_TYPE_CASH}
                        activeColor={colors.accent}
                        activeTextColor={colors.background}
                        inactiveTextColor={colors.text}
                        onPress={() => setListAccount(listAccount === LIST_TYPE_CASH ? '' : LIST_TYPE_CASH)}
                    />
                </View>

                {/* list group — category */}
                <Text style={[styles.textForm, { color: colors.text }]}>{t('category')}</Text>
                <View style={styles.typeContainer}>
                    {categories.map((c) => (
                        <CustomTypeButton
                            key={c.id}
                            label={c.name}
                            isActive={listGroup === c.id}
                            activeColor={colors.accent}
                            activeTextColor={colors.background}
                            inactiveTextColor={colors.text}
                            onPress={() => setListGroup(listGroup === c.id ? '' : c.id)}
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

            <AlertPopup
                visible={showTypeAlert}
                title={t('selectListType')}
                description={t('selectListType')}
                onClose={() => setShowTypeAlert(false)}
                buttonText={t('ok')}
                type="warning"
            />

            <AlertPopup
                visible={showSaveErrorAlert}
                title={t('saveError')}
                description={t('saveError')}
                onClose={() => setShowSaveErrorAlert(false)}
                buttonText={t('ok')}
                type="danger"
            />
        </View>
    )
}

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