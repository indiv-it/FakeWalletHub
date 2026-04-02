import { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Image,
    Animated,
    ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { SIZES, FONTS, COLORS } from "../style/Theme";
import { useRef, useEffect } from 'react';
import { horizontalScale, verticalScale, moderateScale } from '../utils/responsive';

// icons
import Feather from '@expo/vector-icons/Feather';

export default function Register() {
    const navigation = useNavigation();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [loading, setLoading] = useState(false);


    const fadeAnim = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(50)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const handleRegister = () => {
        if (!email || !password || !confirmPassword) {
            setErrorMsg("กรุณากรอกข้อมูลให้ครบ");
            return;
        }

        if (password !== confirmPassword) {
            setErrorMsg("รหัสผ่านไม่ตรงกัน");
            return;
        }

        setErrorMsg("");
        console.log("สมัครสมาชิก");
    };

    return (
        <View style={styles.root}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                    <View style={styles.header}>
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            style={styles.backButton}
                        >
                            <Feather name="arrow-left" size={24} color={COLORS.white} />
                        </TouchableOpacity>
                        <View style={styles.headerTitleContainer}>
                            <Image source={require('../imgs/logoText.png')} style={{ width: 200, height: 50 }} />
                        </View>
                    </View>

                    <Animated.View
                        style={[
                            styles.card,
                            {
                                opacity: fadeAnim,
                                transform: [{ translateY }],
                            },
                        ]}
                    >
                        <Text style={styles.title}>สร้างบัญชี</Text>
                        <Text style={styles.subtitle}>
                            เริ่มต้นออมเงินและจัดการรายจ่ายของคุณ
                        </Text>

                        <Text style={styles.label}>ชื่อ</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Your Name"
                            placeholderTextColor={COLORS.gray}
                            value={name}
                            onChangeText={setName}
                        />

                        <Text style={styles.label}>อีเมล</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="your@email.com"
                            placeholderTextColor={COLORS.gray}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />

                        <Text style={styles.label}>รหัสผ่าน</Text>
                        <View style={styles.passwordContainer}>
                            <TextInput
                                style={styles.passwordInput}
                                placeholder="••••••••"
                                placeholderTextColor={COLORS.gray}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity
                                style={styles.eyeIcon}
                                onPress={() => setShowPassword(!showPassword)}
                            >
                                <Feather
                                    name={showPassword ? 'eye' : 'eye-off'}
                                    size={20}
                                    color={COLORS.gray}
                                />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.label}>ยืนยันรหัสผ่าน</Text>
                        <View style={styles.passwordContainer}>
                            <TextInput
                                style={styles.passwordInput}
                                placeholder="••••••••"
                                placeholderTextColor={COLORS.gray}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry={!showConfirmPassword}
                            />
                            <TouchableOpacity
                                style={styles.eyeIcon}
                                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                <Feather
                                    name={showConfirmPassword ? 'eye' : 'eye-off'}
                                    size={20}
                                    color={COLORS.gray}
                                />
                            </TouchableOpacity>
                        </View>

                        {errorMsg ? (
                            <Text style={styles.errorText}>{errorMsg}</Text>
                        ) : null}

                        <TouchableOpacity
                            style={[styles.registerButton, loading && { opacity: 0.6 }]}
                            activeOpacity={0.9}
                            onPress={handleRegister}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color={COLORS.black} />
                            ) : (
                                <Text style={styles.registerButtonText}>สร้างบัญชี</Text>
                            )}
                        </TouchableOpacity>

                        <View style={styles.helperRow}>
                            <Text style={styles.helperText}>มีบัญชีอยู่แล้ว?</Text>
                            <TouchableOpacity onPress={() => navigation.goBack()}>
                                <Text style={styles.helperLink}> เข้าสู่ระบบ </Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: COLORS.black,
        paddingHorizontal: horizontalScale(20),
        paddingTop: Platform.OS === 'ios' ? verticalScale(60) : verticalScale(50),
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: verticalScale(30),
    },
    backButton: {
        padding: horizontalScale(8),
        marginLeft: -horizontalScale(8),
    },
    headerTitleContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: horizontalScale(40), // offset back button
    },
    appName: {
        marginLeft: horizontalScale(10),
        color: COLORS.white,
        fontSize: SIZES['2xl'],
        fontWeight: FONTS.bold,
    },
    card: {
        backgroundColor: COLORS.cardBg,
        borderRadius: moderateScale(24),
        paddingHorizontal: horizontalScale(20),
        paddingVertical: verticalScale(24),
        borderWidth: 1,
        borderColor: COLORS.chart,
    },
    title: {
        color: COLORS.accent,
        fontSize: SIZES['2xl'],
        fontWeight: FONTS.bold,
        marginBottom: verticalScale(6),
    },
    subtitle: {
        color: COLORS.background_White,
        fontSize: SIZES.sm,
        marginBottom: verticalScale(10),
    },
    label: {
        color: COLORS.white,
        fontSize: SIZES.sm,
        fontWeight: FONTS.bold,
        marginTop: verticalScale(14),
        marginBottom: verticalScale(6),
    },
    input: {
        backgroundColor: COLORS.chart,
        borderRadius: moderateScale(12),
        paddingHorizontal: horizontalScale(16),
        height: verticalScale(48),
        color: COLORS.white,
        fontSize: SIZES.sm,
        fontWeight: FONTS.semibold,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.chart,
        borderRadius: moderateScale(12),
        height: verticalScale(48),
        paddingHorizontal: horizontalScale(16),
    },
    passwordInput: {
        flex: 1,
        color: COLORS.white,
        fontSize: SIZES.sm,
        fontWeight: FONTS.semibold,
        height: '100%',
    },
    eyeIcon: {
        padding: horizontalScale(4),
    },
    errorText: {
        color: '#ff6b6b',
        fontSize: SIZES.xs,
        marginTop: verticalScale(12),
        textAlign: 'center',
    },
    registerButton: {
        marginTop: verticalScale(20),
        backgroundColor: COLORS.accent,
        borderRadius: moderateScale(999),
        paddingVertical: verticalScale(14),
        alignItems: 'center',
        justifyContent: 'center',
    },
    registerButtonText: {
        color: COLORS.black,
        fontSize: SIZES.sm,
        fontWeight: FONTS.bold,
    },
    helperRow: {
        marginTop: verticalScale(20),
        flexDirection: 'row',
        justifyContent: 'center',
    },
    helperText: {
        color: COLORS.background_White,
        fontSize: SIZES.xs,
    },
    helperLink: {
        color: COLORS.accent,
        fontSize: SIZES.xs,
        fontWeight: FONTS.semibold,
    },
});
