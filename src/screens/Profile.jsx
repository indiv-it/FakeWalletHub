import { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Easing,
    Modal,
    Dimensions,
    Pressable,
    Image,
} from "react-native"
import { useNavigation } from '@react-navigation/native';

// components
import { SIZES, FONTS, COLORS, CARD_SHADOW } from '../style/Theme';
import { useTheme } from '../context/ThemeContext';
import Footer from "../components/Footer"

// icon
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Feather from '@expo/vector-icons/Feather';
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const AVATAR_SIZE = Math.min(SCREEN_WIDTH * 0.75, 320);

const CustomSwitch = ({ value, onValueChange, colors }) => {
    const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;

    useEffect(() => {
        Animated.timing(animatedValue, {
            toValue: value ? 1 : 0,
            duration: 250,
            easing: Easing.bezier(0.4, 0.0, 0.2, 1),
            useNativeDriver: false,
        }).start();
    }, [value]);

    const translateX = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [2, 22] // Switch travel distance
    });

    const backgroundColor = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['#353535', colors.accent]
    });

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => onValueChange(!value)}
            style={{ width: 44, height: 24, justifyContent: 'center' }}
        >
            <Animated.View style={[styles.switchTrack, { backgroundColor }]}>
                <Animated.View style={[styles.switchThumb, { transform: [{ translateX }] }]} />
            </Animated.View>
        </TouchableOpacity>
    );
};

const PopupProfile = ({ visible, onClose, onEditProfile, imageUri, colors }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.85)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 280,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 10,
                    tension: 80,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 320,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            fadeAnim.setValue(0);
            scaleAnim.setValue(0.85);
            slideAnim.setValue(50);
        }
    }, [visible]);

    const handleClose = () => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 0.9,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start(() => onClose());
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            statusBarTranslucent
            onRequestClose={handleClose}
        >
            <Pressable style={popupStyles.backdrop} onPress={handleClose}>
                <Animated.View
                    style={[
                        popupStyles.backdropOverlay,
                        { opacity: fadeAnim }
                    ]}
                />
                <View style={popupStyles.contentWrap}>
                    <TouchableOpacity
                        style={[popupStyles.closeBtn, { backgroundColor: colors.chart }]}
                        onPress={handleClose}
                        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    >
                        <Feather name="x" size={28} color={colors.text} />
                    </TouchableOpacity>

                    <Animated.View
                        style={[
                            popupStyles.avatarWrap,
                            {
                                opacity: fadeAnim,
                                transform: [{ scale: scaleAnim }],
                            },
                        ]}
                    >
                        <View style={popupStyles.avatarOuter}>
                            <View style={[popupStyles.avatarInner, { borderColor: colors.background }]}>
                                {imageUri ? (
                                    <Image
                                        source={{ uri: imageUri }}
                                        style={popupStyles.avatarImage}
                                        resizeMode="cover"
                                    />
                                ) : null}
                            </View>
                            <View style={[popupStyles.avatarRing, { borderColor: colors.accent }]} />
                        </View>
                    </Animated.View>

                    <Animated.View
                        style={[
                            popupStyles.footerWrap,
                            {
                                opacity: fadeAnim,
                                transform: [{ translateY: slideAnim }],
                            },
                        ]}
                    >
                        <TouchableOpacity
                            style={[popupStyles.editBtn, { backgroundColor: colors.accent }]}
                            onPress={() => {
                                handleClose();
                                onEditProfile?.();
                            }}
                            activeOpacity={0.85}
                        >
                            <FontAwesome name="pencil" size={16} color={colors.background} />
                            <Text style={[popupStyles.editBtnText, { color: colors.background }]}>แก้ไขโปรไฟล์</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </Pressable>
        </Modal>
    );
};

export default function Profile() {
    const navigation = useNavigation();
    const { colors, isDarkMode, toggleTheme } = useTheme();
    const [popupProfileVisible, setPopupProfileVisible] = useState(false);
    const [dialogType, setDialogType] = useState(null); // 'about' | 'delete' | 'logout'

    const menu1 = [
        {
            name: "แก้ไขโปรไฟล์",
            icon: <FontAwesome name="user" size={20} color={colors.text} />,
        },
        {
            name: "อัปเกรดบัญชี",
            icon: <Feather name="arrow-up-circle" size={20} color={colors.text} />,
        },
        {
            name: "ธีมมืด",
            icon: <AntDesign name="moon" size={20} color={colors.text} />,
            actionComponent: <CustomSwitch value={isDarkMode} onValueChange={toggleTheme} colors={colors} />
        },
        {
            name: "เกี่ยวกับ",
            icon: <FontAwesome6 name="circle-question" size={20} color={colors.text} />,
        },
    ]

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Text style={[styles.textHeader, { color: colors.text }]}>โปรไฟล์</Text>

            {/* profile header */}
            <View style={[styles.profileHeader, { backgroundColor: colors.cardBg }]}>
                <TouchableOpacity
                    style={[styles.userImg, { backgroundColor: colors.black, borderColor: colors.accent }]}
                    onPress={() => setPopupProfileVisible(true)}
                    activeOpacity={0.8}
                />
                <View style={{ flex: 1, gap: 5 }}>
                    <Text style={[styles.textName, { color: colors.text }]}>UserName</Text>
                    <Text style={[styles.textAbout, { color: colors.accent }]}>บัญชีทั่วไป</Text>
                    <Text style={[styles.textAbout, { color: colors.textSecondary }]}>id : 123456</Text>
                </View>
                <View style={{ position: "absolute", right: 15, bottom: 10 }}>
                    <Text style={{ color: colors.accent, fontSize: 8, }}>V.1.0.0</Text>
                </View>
            </View>

            {/* profile body Setting */}
            <Text style={{ marginTop: 20, marginBottom: 10, fontSize: SIZES.sm, fontWeight: FONTS.bold, color: colors.text }}>ตั้งค่า</Text>
            <View style={[styles.menu, { backgroundColor: colors.cardBg }]}>
                {menu1.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[styles.menuItem, item.actionComponent && { justifyContent: 'space-between', paddingRight: 0 }]}
                        disabled={!!item.actionComponent}
                        onPress={() => {
                            if (item.name.startsWith("แก้ไขโปรไฟล์")) {
                                navigation.navigate('EditProfile');
                            } else if (item.name.startsWith("อัปเกรดบัญชี")) {
                                navigation.navigate('UpgradeAccount');
                            }
                        }}
                    >
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 20 }}>
                            {item.icon}
                            <Text style={[styles.textMenu, { color: colors.text }]}>{item.name}</Text>
                        </View>
                        {item.actionComponent && item.actionComponent}
                    </TouchableOpacity>
                ))}
            </View>

            <PopupProfile
                visible={popupProfileVisible}
                onClose={() => setPopupProfileVisible(false)}
                onEditProfile={() => {
                    setPopupProfileVisible(false);
                    navigation.navigate('EditProfile');
                }}
                colors={colors}
            />

            {dialogType && (
                <View style={dialogStyles.overlay}>
                    <TouchableOpacity
                        style={dialogStyles.backdrop}
                        activeOpacity={1}
                        onPress={() => setDialogType(null)}
                    />
                    <View style={[dialogStyles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                        {dialogType === 'about' && (
                            <>
                                <Text style={[dialogStyles.title, { color: colors.text }]}>เกี่ยวกับ MyBank</Text>
                                <Text style={[dialogStyles.message, { color: colors.textSecondary }]}>
                                    แอปสำหรับบันทึกและวิเคราะห์รายรับ-รายจ่ายของคุณ{'\n'}
                                    เวอร์ชัน 1.0.0
                                </Text>
                                <TouchableOpacity
                                    style={[dialogStyles.primaryButton, { backgroundColor: colors.accent }]}
                                    onPress={() => setDialogType(null)}
                                    activeOpacity={0.9}
                                >
                                    <Text style={[dialogStyles.primaryButtonText, { color: colors.background }]}>ปิด</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            )}

            <Footer />
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
        marginVertical: 30,
        textAlign: "center",
    },
    profileHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 20,
        width: "100%",
        height: 100,
        borderRadius: 20,
        padding: 10,
        ...CARD_SHADOW
    },
    textName: {
        fontSize: SIZES.sm,
        fontWeight: FONTS.bold,
    },
    textAbout: {
        fontSize: SIZES.xs,
    },
    userImg: {
        width: 80,
        height: 80,
        borderRadius: 50,
        borderWidth: 2,
    },
    textMenu: {
        fontSize: SIZES.xs,
        fontWeight: FONTS.normal,
    },
    menu: {
        flexDirection: "column",
        borderRadius: 20,
        padding: 10,
        ...CARD_SHADOW,
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 20,
        padding: 10,
        marginHorizontal: 10,
        marginVertical: 5,
    },
    switchTrack: {
        width: 44,
        height: 24,
        borderRadius: 12,
        padding: 2,
    },
    switchThumb: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: COLORS.white,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 2.5,
        elevation: 4,
    },
});

const popupStyles = StyleSheet.create({
    backdrop: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.88)',
    },
    backdropOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'transparent',
    },
    contentWrap: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    closeBtn: {
        position: 'absolute',
        top: 56,
        right: 24,
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    avatarWrap: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 48,
    },
    avatarOuter: {
        width: AVATAR_SIZE,
        height: AVATAR_SIZE,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    avatarInner: {
        width: AVATAR_SIZE - 12,
        height: AVATAR_SIZE - 12,
        borderRadius: (AVATAR_SIZE - 12) / 2,
        borderWidth: 3,
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    avatarRing: {
        position: 'absolute',
        width: AVATAR_SIZE,
        height: AVATAR_SIZE,
        borderRadius: AVATAR_SIZE / 2,
        borderWidth: 3,
    },
    footerWrap: {
        position: 'absolute',
        bottom: 120,
        left: 24,
        right: 24,
        alignItems: 'center',
    },
    editBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingVertical: 15,
        paddingHorizontal: 25,
        borderRadius: 16,
        minWidth: 150,
        shadowColor: COLORS.accent,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    },
    editBtnText: {
        fontSize: SIZES.sm,
        fontWeight: FONTS.semibold,
        color: COLORS.black,
    },
});

const dialogStyles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    card: {
        width: '82%',
        backgroundColor: COLORS.cardBg,
        borderRadius: 18,
        paddingVertical: 20,
        paddingHorizontal: 18,
        borderWidth: 1,
        borderColor: COLORS.chart,
    },
    title: {
        fontSize: SIZES.base,
        fontWeight: FONTS.bold,
        color: COLORS.white,
        marginBottom: 8,
        textAlign: 'center',
    },
    message: {
        fontSize: SIZES.xs,
        color: COLORS.background_White,
        textAlign: 'center',
        lineHeight: 18,
        marginBottom: 18,
    },
    primaryButton: {
        backgroundColor: COLORS.accent,
        borderRadius: 999,
        paddingVertical: 10,
        paddingHorizontal: 18,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        minWidth: 140,
    },
    primaryButtonText: {
        fontSize: SIZES.sm,
        fontWeight: FONTS.bold,
        color: COLORS.black,
    },
    rowButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    secondaryButton: {
        flex: 1,
        borderRadius: 999,
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: COLORS.chart,
    },
    secondaryButtonText: {
        fontSize: SIZES.sm,
        fontWeight: FONTS.semibold,
        color: COLORS.background_White,
    },
});