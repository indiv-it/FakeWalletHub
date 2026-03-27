import { View, Text, StyleSheet, TouchableOpacity, TextInput, Animated, Easing, Platform } from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import { useState, useRef, useEffect } from "react"
import DateTimePicker from '@react-native-community/datetimepicker';

// components
import { COLORS, SIZES, FONTS, CARD_SHADOW } from "../style/Theme"
import { useTheme } from "../context/ThemeContext"
import { useTransaction } from "../context/TransactionContext"

// icons
import Ionicons from '@expo/vector-icons/Ionicons';

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

    const mappedType =
        editItem?.type === "income"
            ? "รายรับ"
            : editItem?.type === "expense"
                ? "รายจ่าย"
                : "รายจ่าย"

    const mappedGroup = editItem?.category || "เงินจำเป็น"
    const mappedAccountRaw = editItem?.listType || "เงินสด"
    const mappedAccount =
        mappedAccountRaw === "เงินในบัญชี" ? "เงินในบัญชี" : mappedAccountRaw

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

        // Map Thai type to English for database
        const typeMapping = {
            'รายรับ': 'income',
            'รายจ่าย': 'expense',
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
                alert('สำเร็จ', 'แก้ไขรายการสำเร็จ');
            } else {
                await addTransaction(transactionData);
                alert('สำเร็จ', 'เพิ่มรายการสำเร็จ');
            }
            navigation.goBack();
        } catch (error) {
            console.error('Error saving transaction:', error);
            alert('Error', 'เกิดข้อผิดพลาดในการบันทึกรายการ กรุณาลองใหม่');
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* header */}
            <Text style={[styles.textHeader, { color: colors.text }]}>{isEditMode ? 'แก้ไขรายการ' : 'เพิ่มรายการ'}</Text>

            {/* Form */}
            <View>
                {/* money */}
                <Text style={[styles.textForm, { color: colors.text }]}>จำนวนเงิน</Text>
                <TextInput
                    keyboardType="number-pad"
                    placeholder="00.00"
                    placeholderTextColor={colors.gray}
                    style={[styles.textInput, { color: colors.text, backgroundColor: colors.cardBg }]}
                    value={amount}
                    onChangeText={setAmount}
                />

                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={[styles.textForm, { color: colors.text }]}>ชื่อรายการ</Text>
                    <Text style={[styles.textForm, { width: "30%", color: colors.text }]}>วันที่</Text>
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
                <Text style={[styles.textForm, { color: colors.text }]}>ประเภทของรายการ</Text>
                <View style={styles.typeContainer}>
                    <CustomTypeButton
                        label="รายรับ"
                        isActive={listType === 'รายรับ'}
                        activeColor={colors.accent}
                        activeTextColor={colors.background}
                        inactiveTextColor={colors.text}
                        onPress={() => setListType('รายรับ')}
                    />
                    <CustomTypeButton
                        label="รายจ่าย"
                        isActive={listType === 'รายจ่าย'}
                        activeColor={colors.red}
                        activeTextColor={colors.white}
                        inactiveTextColor={colors.text}
                        onPress={() => setListType('รายจ่าย')}
                    />
                </View>

                {/* list account */}
                <Text style={[styles.textForm, { color: colors.text }]}>ประเภทของรายการ</Text>
                <View style={styles.typeContainer}>
                    <CustomTypeButton
                        label="เงินในบัญชี"
                        isActive={listAccount === 'เงินในบัญชี'}
                        activeColor={colors.accent}
                        activeTextColor={colors.background}
                        inactiveTextColor={colors.text}
                        onPress={() => setListAccount(listAccount === 'เงินในบัญชี' ? '' : 'เงินในบัญชี')}
                    />
                    <CustomTypeButton
                        label="เงินสด"
                        isActive={listAccount === 'เงินสด'}
                        activeColor={colors.accent}
                        activeTextColor={colors.background}
                        inactiveTextColor={colors.text}
                        onPress={() => setListAccount(listAccount === 'เงินสด' ? '' : 'เงินสด')}
                    />
                </View>

                {/* list group */}
                <Text style={[styles.textForm, { color: colors.text }]}>หมวหมู่</Text>
                <View style={styles.typeContainer}>
                    <CustomTypeButton
                        label="เงินจำเป็น"
                        isActive={listGroup === 'เงินจำเป็น'}
                        activeColor={colors.accent}
                        activeTextColor={colors.background}
                        inactiveTextColor={colors.text}
                        onPress={() => setListGroup(listGroup === 'เงินจำเป็น' ? '' : 'เงินจำเป็น')}
                    />
                    <CustomTypeButton
                        label="เงินตามใจ"
                        isActive={listGroup === 'เงินตามใจ'}
                        activeColor={colors.accent}
                        activeTextColor={colors.background}
                        inactiveTextColor={colors.text}
                        onPress={() => setListGroup(listGroup === 'เงินตามใจ' ? '' : 'เงินตามใจ')}
                    />
                    <CustomTypeButton
                        label="เงินลงทุน"
                        isActive={listGroup === 'เงินลงทุน'}
                        activeColor={colors.accent}
                        activeTextColor={colors.background}
                        inactiveTextColor={colors.text}
                        onPress={() => setListGroup(listGroup === 'เงินลงทุน' ? '' : 'เงินลงทุน')}
                    />
                    <CustomTypeButton
                        label="เงินออม"
                        isActive={listGroup === 'เงินออม'}
                        activeColor={colors.accent}
                        activeTextColor={colors.background}
                        inactiveTextColor={colors.text}
                        onPress={() => setListGroup(listGroup === 'เงินออม' ? '' : 'เงินออม')}
                    />
                </View>
            </View>

            {/* button */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity onPress={() => navigation.navigate("Home")} style={[styles.backButton, { backgroundColor: colors.background, borderColor: colors.accent }]}>
                    <Text style={[styles.textBack, { color: colors.accent }]}>ยกเลิก</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.backButton, { backgroundColor: colors.accent, borderColor: colors.accent }]}
                    onPress={handleSave}
                >
                    <Text style={[styles.textBack, { color: colors.background }]}>บันทึก</Text>
                </TouchableOpacity>
            </View>

            {showAmountAlert && (
                <View style={styles.alertOverlay}>
                    <TouchableOpacity
                        style={styles.alertBackdrop}
                        activeOpacity={1}
                        onPress={() => setShowAmountAlert(false)}
                    />
                    <View style={[styles.alertBox, { backgroundColor: colors.cardBg }]}>
                        <Ionicons name="warning-outline" size={60} color={colors.red} style={{ marginBottom: 20 }} />
                        <Text style={[styles.alertTitle, { color: colors.text }]}>กรุณาระบุจำนวนเงิน</Text>
                        <Text style={[styles.alertMessage, { color: colors.text }]}>
                            โปรดกรอกจำนวนเงินก่อนบันทึกรายการของคุณ
                        </Text>
                        <TouchableOpacity
                            style={[styles.alertButton, { backgroundColor: colors.accent }]}
                            onPress={() => setShowAmountAlert(false)}
                            activeOpacity={0.9}
                        >
                            <Text style={[styles.alertButtonText, { color: colors.background }]}>ตกลง</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
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
        justifyContent: "space-between",
        alignItems: "center",
        position: "absolute",
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