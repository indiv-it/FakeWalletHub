import { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    Animated,
    Easing,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

// components
import { COLORS, SIZES, FONTS, CARD_SHADOW } from '../style/Theme';
import { useTheme } from '../context/ThemeContext';

// icons
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

// ประเภทการแจ้งเตือน
const NOTIFICATION_TYPES = {
    transaction: { icon: 'arrow-right-left', color: COLORS.accent, label: 'ธุรกรรม' },
    budget: { icon: 'piggy-bank-outline', color: '#F59E0B', label: 'งบประมาณ' },
    reminder: { icon: 'bell', color: '#8B5CF6', label: 'เตือนความจำ' },
    system: { icon: 'information-outline', color: COLORS.gray, label: 'ระบบ' },
};

// ข้อมูลการแจ้งเตือนตัวอย่าง
const MOCK_NOTIFICATIONS = [
    {
        id: '1',
        type: 'transaction',
        title: 'บันทึกรายจ่ายสำเร็จ',
        message: 'คุณบันทึกการซื้ออาหาร ฿150',
        time: '10 นาที',
        read: false,
    },
    {
        id: '2',
        type: 'budget',
        title: 'ใกล้ถึงวงเงิน',
        message: 'หมวด "เงินตามใจ" เหลืออีก ฿200',
        time: '1 ชม.',
        read: false,
    },
    {
        id: '3',
        type: 'reminder',
        title: 'เตือนบันทึกรายการ',
        message: 'อย่าลืมบันทึกรายรับ-รายจ่ายวันนี้',
        time: '2 ชม.',
        read: true,
    },
    {
        id: '4',
        type: 'transaction',
        title: 'รายรับใหม่',
        message: 'บันทึกรายรับ ฿5,000 จากเงินเดือน',
        time: 'เมื่อวาน',
        read: true,
    },
    {
        id: '5',
        type: 'system',
        title: 'อัปเดตแอป',
        message: 'MyBank v1.0.0 พร้อมใช้งานแล้ว',
        time: '2 วัน',
        read: true,
    },
];

const NotificationItem = ({ item, index, onPress }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(24)).current;
    const config = NOTIFICATION_TYPES[item.type] || NOTIFICATION_TYPES.system;
    const {colors} = useTheme();

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 320,
                delay: index * 60,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: 0,
                duration: 320,
                delay: index * 60,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    return (
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY }] }}>
            <TouchableOpacity
                style={[styles.notifCard, { backgroundColor: colors.cardBg, borderColor: colors.accent_black }, item.read && styles.notifCardRead]}
                onPress={() => onPress?.(item)}
                activeOpacity={0.85}
            >
                <View style={[styles.notifIconWrap, { backgroundColor: config.color + '40' }]}>
                    <MaterialCommunityIcons
                        name={config.icon}
                        size={22}
                        color={config.color}
                    />
                </View>
                <View style={styles.notifContent}>
                    <View style={styles.notifHeader}>
                        <Text style={[styles.notifTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
                        <Text style={[styles.notifTime, { color: colors.text }]}>{item.time}</Text>
                    </View>
                    <Text style={[styles.notifMessage, { color: colors.text }]} numberOfLines={2}>{item.message}</Text>
                    {!item.read && <View style={[styles.unreadDot, { backgroundColor: colors.accent }]} />}
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

export default function Warn() {
    const navigation = useNavigation();
    const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
    const unreadCount = notifications.filter(n => !n.read).length;
    const {colors} = useTheme();

    const markAllRead = () => {
        setNotifications(prev =>
            prev.map(n => ({ ...n, read: true }))
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={[styles.backBtn, { backgroundColor: colors.chart }]}
                    onPress={() => navigation.navigate('Home')}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                    <Feather name="arrow-left" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>การแจ้งเตือน</Text>
                {unreadCount > 0 && (
                    <TouchableOpacity style={styles.markReadBtn} onPress={markAllRead}>
                        <Text style={[styles.markReadText, { color: colors.accent_black }]}>อ่านทั้งหมด</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Empty / List */}
            {notifications.length === 0 ? (
                <View style={styles.emptyState}>
                    <View style={[styles.emptyIconWrap, { backgroundColor: colors.chart }]}>
                        <Feather name="bell-off" size={48} color={colors.text} />
                    </View>
                    <Text style={[styles.emptyTitle, { color: colors.gray }]}>ไม่มีการแจ้งเตือน</Text>
                    <Text style={[styles.emptyMessage, { color: colors.gray }]}>
                        เมื่อมีการเคลื่อนไหวในบัญชีของคุณ{'\n'}การแจ้งเตือนจะแสดงที่นี่
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item, index }) => (
                        <NotificationItem
                            item={item}
                            index={index}
                            onPress={(n) => {
                                if (!n.read) {
                                    setNotifications(prev =>
                                        prev.map(x => x.id === n.id ? { ...x, read: true } : x)
                                    );
                                }
                            }}
                        />
                    )}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 56,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.06)',
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
    markReadBtn: {
        paddingVertical: 8,
        paddingHorizontal: 14,
    },
    markReadText: {
        fontSize: SIZES.xs,
        fontWeight: FONTS.semibold,
    },
    listContent: {
        padding: 20,
        paddingBottom: 40,
    },
    notifCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 5,
        position: 'relative',
        ...CARD_SHADOW
    },
    notifCardRead: {
        borderLeftColor: 'transparent',
        opacity: 0.85,
    },
    notifIconWrap: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    notifContent: {
        flex: 1,
    },
    notifHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    notifTitle: {
        fontSize: SIZES.sm,
        fontWeight: FONTS.semibold,
        flex: 1,
    },
    notifTime: {
        fontSize: SIZES.xs,
        color: COLORS.gray,
        marginLeft: 8,
    },
    notifMessage: {
        fontSize: SIZES.xs,
        color: COLORS.background_White,
        lineHeight: 18,
    },
    unreadDot: {
        position: 'absolute',
        top: -7,
        right: -3,
        width: 8,
        height: 8,
        borderRadius: 10,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        paddingBottom: 50,
    },
    emptyIconWrap: {
        width: 96,
        height: 96,
        borderRadius: 48,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    emptyTitle: {
        fontSize: SIZES.xl,
        fontWeight: FONTS.bold,
        marginBottom: 8,
    },
    emptyMessage: {
        fontSize: SIZES.sm,
        textAlign: 'center',
        lineHeight: 22,
    },
});
