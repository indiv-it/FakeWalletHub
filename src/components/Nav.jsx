import { useState, useRef, useEffect } from "react";
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Image,
    Text,
    Animated,
    Dimensions,
    TouchableWithoutFeedback,
    Modal,
    TextInput,
    KeyboardAvoidingView,
    Platform,
} from "react-native";

// components
import { useTheme } from '../context/ThemeContext';
import { usePopup } from "../context/PopupContext";
import { useLanguage, LANGUAGES } from "../context/LanguageContext";
import { useCurrency, CURRENCIES } from "../context/CurrencyContext";
import { useCategory } from "../context/CategoryContext";

// icons
import {
    Sun,
    Moon,
    CircleQuestionMark,
    ChevronDown,
    Globe,
    Check,
    Settings,
    Banknote,
    Edit3,
} from 'lucide-react-native';

// Nav Component
export default function Nav() {
    const { colors, toggleTheme, isDarkMode } = useTheme();
    const { openPopup } = usePopup();
    const { currentLang, changeLanguage, t, languages } = useLanguage();
    const { currentCurrency, changeCurrency } = useCurrency();
    const { categories, updateCategoryName } = useCategory();

    const [menuOpen, setMenuOpen] = useState(false);
    const [langMenuOpen, setLangMenuOpen] = useState(false);
    const [curMenuOpen, setCurMenuOpen] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [newCategoryName, setNewCategoryName] = useState('');

    // Animations
    const menuAnim = useRef(new Animated.Value(0)).current;
    const langMenuAnim = useRef(new Animated.Value(0)).current;
    const curMenuAnim = useRef(new Animated.Value(0)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;

    // Toggle dropdown menu
    const toggleMenu = () => {
        const next = !menuOpen;
        setMenuOpen(next);

        if (!next) {
            setLangMenuOpen(false);
            setCurMenuOpen(false);
            Animated.parallel([
                Animated.timing(menuAnim, {
                    toValue: 0,
                    duration: 250,
                    useNativeDriver: true,
                }),
                Animated.timing(rotateAnim, {
                    toValue: 0,
                    duration: 250,
                    useNativeDriver: true,
                }),
                Animated.timing(langMenuAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: false,
                }),
                Animated.timing(curMenuAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: false,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.spring(menuAnim, {
                    toValue: 1,
                    friction: 8,
                    tension: 65,
                    useNativeDriver: true,
                }),
                Animated.timing(rotateAnim, {
                    toValue: 1,
                    duration: 250,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    };

    const toggleLangMenu = () => {
        const next = !langMenuOpen;
        setLangMenuOpen(next);
        if (next && curMenuOpen) toggleCurMenu(); // Close the other

        Animated.timing(langMenuAnim, {
            toValue: next ? 1 : 0,
            duration: 250,
            useNativeDriver: false,
        }).start();
    };

    // Toggle currency menu
    const toggleCurMenu = () => {
        const next = !curMenuOpen;
        setCurMenuOpen(next);
        if (next && langMenuOpen) toggleLangMenu(); // Close the other

        Animated.timing(curMenuAnim, {
            toValue: next ? 1 : 0,
            duration: 250,
            useNativeDriver: false,
        }).start();
    };

    // Close menu
    const closeMenu = () => {
        setMenuOpen(false);
        setLangMenuOpen(false);
        setCurMenuOpen(false);

        Animated.parallel([
            Animated.timing(menuAnim, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            }),
            Animated.timing(rotateAnim, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            }),
            Animated.timing(langMenuAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: false,
            }),
            Animated.timing(curMenuAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: false,
            }),
        ]).start();
    };

    // Handle language selection
    const handleLangSelect = (langCode) => {
        changeLanguage(langCode);
        closeMenu();
    };

    // Handle currency selection
    const handleCurSelect = (curCode) => {
        changeCurrency(curCode);
        closeMenu();
    };

    // Handle editing category
    const handleSaveCategory = async () => {
        if (editingCategory && newCategoryName.trim()) {
            await updateCategoryName(editingCategory.id, newCategoryName.trim());
            setEditingCategory(null);
            setNewCategoryName('');
            setShowCategoryModal(false);
        }
    };

    // Menu animation
    const menuScale = menuAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.9, 1],
    });

    const menuOpacity = menuAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
    });

    const menuTranslateY = menuAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [-10, 0],
    });

    // Chevron main
    const rotateInterpolate = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg'],
    });

    // ✅ Lang submenu height
    const langHeight = langMenuAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, Object.keys(LANGUAGES).length * 48 + 8],
    });

    // fade submenu
    const langOpacity = langMenuAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
    });

    const langRotate = langMenuAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg'],
    });

    const curHeight = curMenuAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, Object.keys(CURRENCIES).length * 48 + 8],
    });

    const curOpacity = curMenuAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
    });

    const curRotate = curMenuAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg'],
    });

    // Menu item component with stagger animation
    const MenuItem = ({ icon, label, onPress, rightContent, isLast, index }) => {
        const itemAnim = useRef(new Animated.Value(0)).current;

        useEffect(() => {
            if (menuOpen) {
                Animated.timing(itemAnim, {
                    toValue: 1,
                    duration: 200,
                    delay: index * 60,
                    useNativeDriver: true,
                }).start();
            } else {
                itemAnim.setValue(0);
            }
        }, [menuOpen]);

        const itemTranslateX = itemAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [20, 0],
        });

        const itemOpacity = itemAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
        });

        return (
            <Animated.View style={{ transform: [{ translateX: itemTranslateX }], opacity: itemOpacity }}>
                <TouchableOpacity
                    style={[
                        styles.menuItem,
                        {
                            borderBottomColor: isLast ? 'transparent' : colors.border,
                            borderBottomWidth: isLast ? 0 : 1,
                        },
                    ]}
                    onPress={onPress}
                    activeOpacity={0.6}
                >
                    <View style={styles.menuItemLeft}>
                        <View style={[styles.menuIconContainer, { backgroundColor: colors.accent + '18' }]}>
                            {icon}
                        </View>
                        <Text style={[styles.menuItemText, { color: colors.text }]}>
                            {label}
                        </Text>
                    </View>
                    {rightContent}
                </TouchableOpacity>
            </Animated.View>
        );
    };

    const LangItem = ({ lang, isSelected }) => (
        <TouchableOpacity
            style={[
                styles.langItem,
                isSelected && { backgroundColor: colors.accent + '15' },
            ]}
            onPress={() => handleLangSelect(lang.code)}
            activeOpacity={0.6}
        >
            <Text style={styles.langFlag}>{lang.flag}</Text>
            <View style={{ flex: 1 }}>
                <Text style={[styles.langName, { color: colors.text }]}>
                    {lang.nativeName}
                </Text>
            </View>
            {isSelected && (
                <View style={[styles.checkBadge, { backgroundColor: colors.accent }]}>
                    <Check size={12} color={colors.background} strokeWidth={3} />
                </View>
            )}
        </TouchableOpacity>
    );

    // Currency item in submenu
    const CurItem = ({ cur, isSelected }) => (
        <TouchableOpacity
            style={[
                styles.langItem,
                isSelected && { backgroundColor: colors.accent + '15' },
            ]}
            onPress={() => handleCurSelect(cur.code)}
            activeOpacity={0.6}
        >
            <Text style={styles.langFlag}>{cur.symbol}</Text>
            <View style={{ flex: 1 }}>
                <Text style={[styles.langName, { color: colors.text }]}>
                    {cur.name}
                </Text>
            </View>
            {isSelected && (
                <View style={[styles.checkBadge, { backgroundColor: colors.accent }]}>
                    <Check size={12} color={colors.background} strokeWidth={3} />
                </View>
            )}
        </TouchableOpacity>
    );

    return (
        <>
            {/* Backdrop overlay when menu is open */}
            {menuOpen && (
                <Modal transparent visible={menuOpen} animationType="none" onRequestClose={closeMenu}>
                    <View style={{ flex: 1 }}>
                        <TouchableWithoutFeedback onPress={closeMenu}>
                            <View style={styles.backdrop} />
                        </TouchableWithoutFeedback>

                        {/* Dropdown Menu */}
                        <Animated.View
                        style={[
                            styles.dropdownMenu,
                            {
                                backgroundColor: colors.cardBg,
                                borderColor: colors.border,
                                opacity: menuOpacity,
                                transform: [
                                    { scale: menuScale },
                                    { translateY: menuTranslateY },
                                ],
                            },
                        ]}
                    >
                        {/* Menu Header */}
                        <View style={[styles.menuHeader, { borderBottomColor: colors.border }]}>
                            <View style={[styles.menuHeaderIconBg, { backgroundColor: colors.accent + '20' }]}>
                                <Settings size={16} color={colors.accent} />
                            </View>
                            <Text style={[styles.menuHeaderText, { color: colors.text }]}>
                                {t('settings')}
                            </Text>
                        </View>

                        {/* Theme Toggle */}
                        <MenuItem
                            index={0}
                            icon={
                                isDarkMode
                                    ? <Moon size={18} color={colors.accent} />
                                    : <Sun size={18} color={colors.accent} />
                            }
                            label={isDarkMode ? t('darkMode') : t('lightMode')}
                            onPress={() => {
                                toggleTheme();
                            }}
                            rightContent={
                                <View style={[
                                    styles.toggleTrack,
                                    { backgroundColor: isDarkMode ? colors.accent : colors.gray + '40' },
                                ]}>
                                    <View style={[
                                        styles.toggleThumb,
                                        {
                                            backgroundColor: colors.white,
                                            transform: [{ translateX: isDarkMode ? 18 : 2 }],
                                        },
                                    ]} />
                                </View>
                            }
                        />

                        {/* Language Selector */}
                        <MenuItem
                            index={1}
                            icon={<Globe size={18} color={colors.accent} />}
                            label={t('language')}
                            onPress={toggleLangMenu}
                            rightContent={
                                <View style={styles.langBadgeContainer}>
                                    <Text style={styles.langBadgeFlag}>{languages[currentLang].flag}</Text>
                                    <Text style={[styles.langBadgeText, { color: colors.textSecondary }]}>
                                        {languages[currentLang].name}
                                    </Text>
                                    <Animated.View style={{
                                        transform: [{ rotate: langRotate }],
                                    }}>
                                        <ChevronDown size={14} color={colors.textSecondary} />
                                    </Animated.View>
                                </View>
                            }
                        />

                        {/* Language Sub-menu */}
                        <Animated.View
                            style={[
                                styles.langSubmenu,
                                {
                                    height: langHeight,
                                    opacity: langOpacity,
                                    backgroundColor: colors.background + '80',
                                    borderColor: langMenuOpen ? colors.border : 'transparent',
                                    overflow: 'hidden',
                                },
                            ]}
                        >
                            {Object.values(LANGUAGES).map((lang) => (
                                <LangItem
                                    key={lang.code}
                                    lang={lang}
                                    isSelected={currentLang === lang.code}
                                />
                            ))}
                        </Animated.View>

                        {/* Currency Selector */}
                        <MenuItem
                            index={3}
                            icon={<Banknote size={18} color={colors.accent} />}
                            label={t('currency')}
                            onPress={toggleCurMenu}
                            rightContent={
                                <View style={styles.langBadgeContainer}>
                                    <Text style={styles.langBadgeFlag}>{CURRENCIES[currentCurrency].symbol}</Text>
                                    <Animated.View style={{
                                        transform: [{ rotate: curRotate }],
                                    }}>
                                        <ChevronDown size={14} color={colors.textSecondary} />
                                    </Animated.View>
                                </View>
                            }
                        />

                        {/* Currency Sub-menu */}
                        <Animated.View
                            style={[
                                styles.langSubmenu,
                                {
                                    height: curHeight,
                                    opacity: curOpacity,
                                    backgroundColor: colors.background + '80',
                                    borderColor: curMenuOpen ? colors.border : 'transparent',
                                    overflow: 'hidden',
                                },
                            ]}
                        >
                            {Object.values(CURRENCIES).map((cur) => (
                                <CurItem
                                    key={cur.code}
                                    cur={cur}
                                    isSelected={currentCurrency === cur.code}
                                />
                            ))}
                        </Animated.View>

                        {/* Edit Categories */}
                        <MenuItem
                            index={4}
                            icon={<Edit3 size={18} color={colors.accent} />}
                            label={t('editCategory')}
                            onPress={() => {
                                closeMenu();
                                setShowCategoryModal(true);
                            }}
                        />

                        {/* About */}
                        <MenuItem
                            index={5}
                            icon={<CircleQuestionMark size={18} color={colors.accent} />}
                            label={t('about')}
                            onPress={() => {
                                closeMenu();
                                openPopup();
                            }}
                            isLast
                        />
                    </Animated.View>
                    </View>
                </Modal>
            )}

            {/* Nav Bar */}
            <View style={styles.nav}>
                <View style={[styles.logoContainer, { backgroundColor: isDarkMode ? colors.background : colors.accent }]}>
                    <Image source={require('../imgs/Logo_FWH.png')} style={styles.img} />
                    <Text style={{ color: colors.white, fontWeight: 'bold' }}>
                        <Text style={{ color: isDarkMode ? colors.accent : colors.white }}>Fake</Text>
                        WalletHub
                    </Text>
                </View>

                {/* Dropdown Toggle Button */}
                <TouchableOpacity
                    style={[
                        styles.menuButton,
                        {
                            backgroundColor: menuOpen
                                ? colors.accent + '20'
                                : isDarkMode ? colors.cardBg : colors.background,
                            borderColor: menuOpen ? colors.accent + '50' : colors.border,
                        },
                    ]}
                    onPress={toggleMenu}
                    activeOpacity={0.7}
                >
                    <View style={styles.menuButtonInner}>
                        <Text style={styles.menuButtonFlag}>{languages[currentLang].flag}</Text>
                        {isDarkMode
                            ? <Moon size={16} color={colors.accent} />
                            : <Sun size={16} color={colors.accent} />
                        }
                        <Animated.View style={{ transform: [{ rotate: rotateInterpolate }] }}>
                            <ChevronDown size={16} color={colors.textSecondary} />
                        </Animated.View>
                    </View>
                </TouchableOpacity>
            </View>

            {/* Category Edit Modal */}
            <Modal transparent visible={showCategoryModal} animationType="fade" onRequestClose={() => setShowCategoryModal(false)}>
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                    <TouchableWithoutFeedback onPress={() => { setShowCategoryModal(false); setEditingCategory(null); setNewCategoryName(''); }}>
                        <View style={styles.backdrop} />
                    </TouchableWithoutFeedback>
                    <View style={[styles.categoryModal, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                        <Text style={[styles.categoryModalTitle, { color: colors.text }]}>{t('editCategory')}</Text>
                        
                        {editingCategory ? (
                            <View>
                                <Text style={{ color: colors.textSecondary, marginBottom: 8 }}>แก้ไขชื่อใหม่</Text>
                                <TextInput
                                    style={[styles.categoryInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                                    value={newCategoryName}
                                    onChangeText={setNewCategoryName}
                                    autoFocus
                                    placeholderTextColor={colors.textSecondary}
                                />
                                <View style={styles.categoryActions}>
                                    <TouchableOpacity style={[styles.categoryBtn, { backgroundColor: colors.border }]} onPress={() => { setEditingCategory(null); setNewCategoryName(''); }}>
                                        <Text style={{ color: colors.text, fontWeight: 'bold' }}>{t('cancel')}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.categoryBtn, { backgroundColor: colors.accent }]} onPress={handleSaveCategory}>
                                        <Text style={{ color: colors.white, fontWeight: 'bold' }}>{t('save')}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ) : (
                            <View>
                                {categories.map(cat => (
                                    <View key={cat.id} style={[styles.categoryRow, { borderBottomColor: colors.border }]}>
                                        <Text style={{ color: colors.text, fontSize: 16 }}>{cat.name}</Text>
                                        <TouchableOpacity 
                                            onPress={() => { setEditingCategory(cat); setNewCategoryName(cat.name); }}
                                            style={{ padding: 8, backgroundColor: colors.accent + '20', borderRadius: 8 }}
                                        >
                                            <Edit3 size={16} color={colors.accent} />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                                <TouchableOpacity style={[styles.categoryCloseBtn, { backgroundColor: colors.border, marginTop: 16 }]} onPress={() => setShowCategoryModal(false)}>
                                    <Text style={{ color: colors.text, fontWeight: 'bold' }}>{t('close')}</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    nav: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 30,
        marginBottom: 20,
        zIndex: 1000,
    },
    logoContainer: {
        paddingHorizontal: 15,
        paddingVertical: 5,
        borderRadius: 10,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    img: {
        width: 30,
        height: 30,
    },

    // Menu toggle button
    menuButton: {
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    menuButtonInner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    menuButtonFlag: {
        fontSize: 16,
    },

    // Backdrop
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.25)',
    },

    // Dropdown menu
    dropdownMenu: {
        position: 'absolute',
        top: 70,
        right: 16,
        width: 260,
        borderRadius: 16,
        borderWidth: 1,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 12,
    },

    // Menu header
    menuHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
    },
    menuHeaderIconBg: {
        width: 30,
        height: 30,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuHeaderText: {
        fontSize: 15,
        fontWeight: '700',
    },

    // Menu items
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 13,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    menuIconContainer: {
        width: 34,
        height: 34,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuItemText: {
        fontSize: 14,
        fontWeight: '500',
    },

    // Toggle switch
    toggleTrack: {
        width: 40,
        height: 22,
        borderRadius: 11,
        justifyContent: 'center',
    },
    toggleThumb: {
        width: 18,
        height: 18,
        borderRadius: 9,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },

    // Language badge on menu item
    langBadgeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    langBadgeFlag: {
        fontSize: 14,
    },
    langBadgeText: {
        fontSize: 12,
        fontWeight: '500',
    },

    // Language submenu
    langSubmenu: {
        marginHorizontal: 12,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        marginBottom: 4,
    },
    langItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 12,
        gap: 12,
    },
    langFlag: {
        fontSize: 20,
    },
    langName: {
        fontSize: 14,
        fontWeight: '500',
    },

    // Check badge
    checkBadge: {
        width: 22,
        height: 22,
        borderRadius: 11,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Category Modal
    categoryModal: {
        position: 'absolute',
        top: '25%',
        left: 20,
        right: 20,
        borderRadius: 16,
        padding: 24,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
    },
    categoryModalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    categoryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    categoryInput: {
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        marginBottom: 20,
    },
    categoryActions: {
        flexDirection: 'row',
        gap: 12,
    },
    categoryBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    categoryCloseBtn: {
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
});
