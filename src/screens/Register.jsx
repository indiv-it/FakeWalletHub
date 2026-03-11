import { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Animated,
    Easing,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { SIZES, FONTS, COLORS } from "../style/Theme";

// icons
import Feather from '@expo/vector-icons/Feather';

export default function Register() {
    const { colors } = useTheme();
    const navigation = useNavigation();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(24)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 450,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: 0,
                duration: 450,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const handleRegister = () => {
        // TODO: เชื่อมต่อระบบสมัครสมาชิกจริง
        navigation.goBack();
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
                           <Feather name="pie-chart" size={26} color={COLORS.accent} />
                           <Text style={styles.appName}>MyBank</Text>
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

                        <Text style={styles.label}>ชื่อ-นามสกุล</Text>
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

                        <TouchableOpacity
                            style={styles.registerButton}
                            activeOpacity={0.9}
                            onPress={handleRegister}
                        >
                            <Text style={styles.registerButtonText}>สร้างบัญชี</Text>
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
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 60 : 50,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
    },
    backButton: {
        padding: 8,
        marginLeft: -8,
    },
    headerTitleContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 40, // offset back button
    },
    appName: {
        marginLeft: 10,
        color: COLORS.white,
        fontSize: SIZES['2xl'],
        fontWeight: FONTS.bold,
    },
    card: {
        backgroundColor: COLORS.cardBg,
        borderRadius: 24,
        paddingHorizontal: 20,
        paddingVertical: 24,
        borderWidth: 1,
        borderColor: COLORS.chart,
    },
    title: {
        color: COLORS.accent,
        fontSize: SIZES['2xl'],
        fontWeight: FONTS.bold,
        marginBottom: 6,
    },
    subtitle: {
        color: COLORS.background_White,
        fontSize: SIZES.sm,
        marginBottom: 10,
    },
    label: {
        color: COLORS.white,
        fontSize: SIZES.sm,
        fontWeight: FONTS.bold,
        marginTop: 14,
        marginBottom: 6,
    },
    input: {
        backgroundColor: COLORS.chart,
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 48,
        color: COLORS.white,
        fontSize: SIZES.sm,
        fontWeight: FONTS.semibold,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.chart,
        borderRadius: 12,
        height: 48,
        paddingHorizontal: 16,
    },
    passwordInput: {
        flex: 1,
        color: COLORS.white,
        fontSize: SIZES.sm,
        fontWeight: FONTS.semibold,
        height: '100%',
    },
    eyeIcon: {
        padding: 4,
    },
    registerButton: {
        marginTop: 32,
        backgroundColor: COLORS.accent,
        borderRadius: 999,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    registerButtonText: {
        color: COLORS.black,
        fontSize: SIZES.sm,
        fontWeight: FONTS.bold,
    },
    helperRow: {
        marginTop: 20,
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
