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
import { useLanguage } from '../context/LanguageContext';

// icons
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const NotificationItem = ({ item, index, onPress }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(24)).current;
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
                <View style={[styles.notifIconWrap, { backgroundColor: item.color + '40' }]}>
                    <MaterialCommunityIcons
                        name={item.icon}
                        size={22}
                        color={item.color}
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
    const {colors} = useTheme();
    const { t } = useLanguage();

    // Build notification data using translations
    const buildNotifications = () => [
        {
            id: '1',
            type: 'transaction',
            icon: 'arrow-right-left',
            color: COLORS.accent,
            title: t('notifTitle1'),
            message: t('notifMsg1'),
            time: t('notifTime1'),
            read: false,
        },
        {
            id: '2',
            type: 'budget',
            icon: 'piggy-bank-outline',
            color: '#F59E0B',
            title: t('notifTitle2'),
            message: t('notifMsg2'),
            time: t('notifTime2'),
            read: false,
        },
        {
            id: '3',
            type: 'reminder',
            icon: 'bell',
            color: '#8B5CF6',
            title: t('notifTitle3'),
            message: t('notifMsg3'),
            time: t('notifTime3'),
            read: true,
        },
        {
            id: '4',
            type: 'transaction',
            icon: 'arrow-right-left',
            color: COLORS.accent,
            title: t('notifTitle4'),
            message: t('notifMsg4'),
            time: t('notifTime4'),
            read: true,
        },
        {
            id: '5',
            type: 'system',
            icon: 'information-outline',
            color: COLORS.gray,
            title: t('notifTitle5'),
            message: t('notifMsg5'),
            time: t('notifTime5'),
            read: true,
        },
    ];

    const [notifications, setNotifications] = useState(buildNotifications());
    const unreadCount = notifications.filter(n => !n.read).length;

    // Update notifications when language changes
    useEffect(() => {
        setNotifications(prev => {
            const fresh = buildNotifications();
            return fresh.map((n, i) => ({
                ...n,
                read: prev[i]?.read ?? n.read,
            }));
        });
    }, [t]);

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
                <Text style={[styles.headerTitle, { color: colors.text }]}>{t('notifications')}</Text>
                {unreadCount > 0 && (
                    <TouchableOpacity style={styles.markReadBtn} onPress={markAllRead}>
                        <Text style={[styles.markReadText, { color: colors.accent_black }]}>{t('markAllRead')}</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Empty / List */}
            {notifications.length === 0 ? (
                <View style={styles.emptyState}>
                    <View style={[styles.emptyIconWrap, { backgroundColor: colors.chart }]}>
                        <Feather name="bell-off" size={48} color={colors.text} />
                    </View>
                    <Text style={[styles.emptyTitle, { color: colors.gray }]}>{t('noNotification')}</Text>
                    <Text style={[styles.emptyMessage, { color: colors.gray }]}>
                        {t('noNotificationDesc')}
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
