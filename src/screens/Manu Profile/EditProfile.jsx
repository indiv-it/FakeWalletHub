import { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SIZES, FONTS, IMG_SHADOW } from '../../style/Theme';
import { useTheme } from '../../context/ThemeContext';
import Feather from '@expo/vector-icons/Feather';

export default function EditProfile() {
    const { colors } = useTheme();
    const navigation = useNavigation();
    const [name, setName] = useState('UserName');
    const [email, setEmail] = useState('@email.com');
    const [password, setPassword] = useState('********');

    const handleSave = () => {
        // TODO: เชื่อมต่อการบันทึกโปรไฟล์จริง
        navigation.goBack();
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.headerRow}>
                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => navigation.goBack()}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                    <Feather name="arrow-left" size={22} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>แก้ไขโปรไฟล์</Text>
                <View style={{ width: 44 }} />
            </View>

            <View style={styles.avatarSection}>
                <View style={[styles.avatarOuter, { borderColor: colors.accent }]}>
                    <View style={[styles.avatarInner, { borderColor: colors.accent }]}>
                        <Image
                            source={require('../../../assets/icon.png')}
                            style={{ width: '100%', height: '100%' }}
                            resizeMode="cover"
                        />
                    </View>
                </View>
                <TouchableOpacity style={[styles.avatarButton, { backgroundColor: colors.cardBg }]} activeOpacity={0.85}>
                    <Feather name="camera" size={16} color={colors.text} />
                    <Text style={[styles.avatarButtonText, { color: colors.text }]}>เปลี่ยนรูปโปรไฟล์</Text>
                </TouchableOpacity>
                <Text style={{ color: colors.textSecondary, fontSize: SIZES.xs, marginTop: 8 }}>ID : 123456</Text>
            </View>

            <View>
                <Text style={[styles.label, { color: colors.text }]}>ชื่อแสดงผล</Text>
                <TextInput
                    style={[styles.input, { backgroundColor: colors.cardBg, color: colors.text, borderColor: colors.border }]}
                    value={name}
                    onChangeText={setName}
                    placeholder="ชื่อของคุณ"
                    placeholderTextColor={colors.textSecondary}
                />

                <Text style={[styles.label, { color: colors.text }]}>อีเมล</Text>
                <TextInput
                    style={[styles.input, styles.inputDisabled, { backgroundColor: colors.cardBg, color: colors.textSecondary, borderColor: colors.border }]}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="E-mail"
                    placeholderTextColor={colors.textSecondary}
                    editable={false}
                />
                <Text style={[styles.label, { color: colors.text }]}>รหัสผ่าน</Text>
                <TextInput
                    style={[styles.input, styles.inputDisabled, { backgroundColor: colors.cardBg, color: colors.textSecondary, borderColor: colors.border }]}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Password"
                    placeholderTextColor={colors.textSecondary}
                    editable={false}
                />
                <Text style={[styles.changePasswordText, { color: colors.accent }]}>เปลี่ยนรหัสผ่าน</Text>
            </View>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.saveButton, { backgroundColor: colors.accent }]}
                    activeOpacity={0.9}
                    onPress={handleSave}
                >
                    <Text style={[styles.saveButtonText, { color: colors.black }]}>บันทึกการเปลี่ยนแปลง</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const AVATAR_SIZE = 96;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 40,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: SIZES.xl,
        fontWeight: FONTS.bold,
    },
    avatarSection: {
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 24,
    },
    avatarOuter: {
        width: AVATAR_SIZE + 10,
        height: AVATAR_SIZE + 10,
        borderRadius: (AVATAR_SIZE + 10) / 2,
        alignItems: 'center',
        justifyContent: 'center',
        ...IMG_SHADOW,
    },
    avatarInner: {
        width: AVATAR_SIZE,
        height: AVATAR_SIZE,
        borderRadius: AVATAR_SIZE / 2,
        overflow: 'hidden',
        borderWidth: 2,
    },
    avatarButton: {
        marginTop: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 999,
    },
    avatarButtonText: {
        fontSize: SIZES.xs,
        fontWeight: FONTS.semibold,
    },
    label: {
        fontSize: SIZES.sm,
        fontWeight: FONTS.bold,
        marginTop: 16,
        marginBottom: 6,
    },
    input: {
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: SIZES.sm,
        fontWeight: FONTS.semibold,
        borderWidth: 1,
    },
    inputDisabled: {
        opacity: 0.5,
    },
    changePasswordText: {
        fontSize: SIZES.xs,
        fontWeight: FONTS.semibold,
        marginTop: 8,
    },
    footer: {
        position: 'absolute',
        left: 20,
        right: 20,
        bottom: 40,
    },
    saveButton: {
        borderRadius: 16,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveButtonText: {
        fontSize: SIZES.sm,
        fontWeight: FONTS.bold,
    },
});

