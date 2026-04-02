import { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Animated,
    KeyboardAvoidingView,
    Platform,
    Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

// components
import { SIZES, FONTS, COLORS } from '../style/Theme';
import { horizontalScale, verticalScale, moderateScale } from '../utils/responsive';

// icons
import Feather from '@expo/vector-icons/Feather';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';


export default function Login() {
    const ImgGoogle = require("../imgs/google_img.png")
    const navigation = useNavigation();
    const [showPassword, setShowPassword] = useState(false);

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

    const handleLogin = async () => {
        navigation.replace("Home");
    };

    return (
        <View style={styles.root}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <View style={styles.header}>
                    <Image source={require('../imgs/logoText.png')} style={{ width: 200, height: 50 }} />
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
                    <Text style={styles.title}>เข้าสู่ระบบ</Text>
                    <Text style={styles.subtitle}>
                        จัดการรายรับรายจ่ายของคุณได้ง่าย ๆ
                    </Text>

                    <Text style={styles.label}>อีเมลหรือชื่อผู้ใช้</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="your@email.com"
                        placeholderTextColor={COLORS.gray}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    <Text style={styles.label}>รหัสผ่าน</Text>
                    <View style={styles.passwordContainer}>
                        <TextInput
                            style={styles.passwordInput}
                            placeholder="••••••••"
                            placeholderTextColor={COLORS.gray}
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

                    <TouchableOpacity activeOpacity={0.8}>
                        <Text style={styles.forgotText}>ลืมรหัสผ่าน?</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.loginButton}
                        activeOpacity={0.9}
                        onPress={handleLogin}
                    >
                        <Text style={styles.loginButtonText}>เข้าสู่ระบบ</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.helperRow}
                        onPress={() => navigation.navigate('SignIn')}
                    >
                        <Text style={styles.helperText}>ยังไม่มีบัญชี?</Text>
                        <Text style={styles.helperLink}> สร้างบัญชี </Text>
                    </TouchableOpacity>

                    <Text style={styles.textSignin}>หรือเข้าสู่ระบบโดย</Text>
                    <TouchableOpacity onPress={handleLogin} style={styles.signinButton}>
                        <Image source={ImgGoogle} style={styles.imgLogo} />
                        <Text style={{ fontWeight: FONTS.semibold, fontSize: SIZES.xs, color: COLORS.gray }}>Sign in with Google</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleLogin} style={[styles.signinButton, { backgroundColor: "#0866ff" }]}>
                        <FontAwesome5 name="facebook" size={22} color="white" />
                        <Text style={{ fontWeight: FONTS.semibold, fontSize: SIZES.xs, color: COLORS.background_White }}>Sign in with Facebook</Text>
                    </TouchableOpacity>
                </Animated.View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: COLORS.black,
        paddingHorizontal: horizontalScale(20),
        paddingTop: verticalScale(50),
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: verticalScale(30),
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
    forgotText: {
        color: COLORS.background_White,
        fontSize: SIZES.xs,
        alignSelf: 'flex-end',
        marginTop: verticalScale(8),
    },
    errorText: {
        color: '#ff6b6b',
        fontSize: SIZES.xs,
        marginTop: verticalScale(10),
        textAlign: 'center',
    },
    loginButton: {
        marginTop: verticalScale(24),
        backgroundColor: COLORS.accent,
        borderRadius: moderateScale(999),
        paddingVertical: verticalScale(14),
        alignItems: 'center',
        justifyContent: 'center',
    },
    loginButtonText: {
        color: COLORS.black,
        fontSize: SIZES.sm,
        fontWeight: FONTS.bold,
    },
    helperRow: {
        marginTop: verticalScale(16),
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
    textSignin: {
        color: COLORS.gray,
        textAlign: "center",
        fontSize: SIZES.xs,
        fontWeight: FONTS.semibold,
        marginTop: verticalScale(20),
        marginBottom: verticalScale(5),
    },
    signinButton: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: COLORS.white,
        height: verticalScale(50),
        borderRadius: moderateScale(50),
        paddingHorizontal: horizontalScale(20),
        gap: horizontalScale(10),
        marginTop: verticalScale(10),
    },
    imgLogo: {
        width: horizontalScale(20),
        height: horizontalScale(20)
    }
});

