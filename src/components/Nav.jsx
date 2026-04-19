import { useState, useRef, useEffect } from "react";
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Image,
    Text,
    Animated,
    TouchableWithoutFeedback,
    Modal,
    TextInput,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { BlurView } from 'expo-blur';
import { horizontalScale, verticalScale, moderateScale } from "../utils/responsive";

// --- Theme & Components ---
import { useTheme } from '../context/ThemeContext';
import { usePopup } from "../context/PopupContext";
import { useLanguage, LANGUAGES } from "../context/LanguageContext";
import { useCurrency, CURRENCIES } from "../context/CurrencyContext";
import { useCategory } from "../context/CategoryContext";
import { CARD_SHADOW } from "../style/Theme";

// --- Icons ---
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
    ShoppingCart,
    ShoppingBag,
    ChartColumnBig,
    PiggyBank,
    Heart,
    Home as HomeIcon,
    Car,
    Utensils,
    Gift,
    BookOpen,
    Briefcase,
    Gamepad2,
    Plane,
    Stethoscope,
    GraduationCap,
} from 'lucide-react-native';

// --- Constants ---
const AVAILABLE_ICONS = [
    { name: 'ShoppingCart', Icon: ShoppingCart },
    { name: 'ShoppingBag', Icon: ShoppingBag },
    { name: 'ChartColumnBig', Icon: ChartColumnBig },
    { name: 'PiggyBank', Icon: PiggyBank },
    { name: 'Heart', Icon: Heart },
    { name: 'HomeIcon', Icon: HomeIcon },
    { name: 'Car', Icon: Car },
    { name: 'Utensils', Icon: Utensils },
    { name: 'Gift', Icon: Gift },
    { name: 'BookOpen', Icon: BookOpen },
    { name: 'Briefcase', Icon: Briefcase },
    { name: 'Gamepad2', Icon: Gamepad2 },
    { name: 'Plane', Icon: Plane },
    { name: 'Stethoscope', Icon: Stethoscope },
    { name: 'GraduationCap', Icon: GraduationCap },
];

/**
 * Map icon name to component for easy rendering
 */
export const getIconComponent = (name, size, color) => {
    const iconObj = AVAILABLE_ICONS.find(i => i.name === name);
    if (iconObj) {
        const { Icon } = iconObj;
        return <Icon size={size} color={color} />;
    }
    return null;
};

/**
 * Nav Component
 * The top navigation bar, featuring dropdown menus for theme, language,
 * currency settings, as well as category customization modals.
 */
export default function Nav() {
    // --- Context Hooks ---
    const { colors, toggleTheme, isDarkMode } = useTheme();
    const { openPopup } = usePopup();
    const { currentLang, changeLanguage, t, languages } = useLanguage();
    const { currentCurrency, changeCurrency } = useCurrency();
    const { categories, editCategory, editCategoryIcon } = useCategory();

    // --- State: Menus ---
    const [menuOpen, setMenuOpen] = useState(false);
    const [langMenuOpen, setLangMenuOpen] = useState(false);
    const [curMenuOpen, setCurMenuOpen] = useState(false);

    // --- State: Category Modal ---
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [selectedIcon, setSelectedIcon] = useState(null);

    // --- Animation Refs ---
    const menuAnim = useRef(new Animated.Value(0)).current;
    const langMenuAnim = useRef(new Animated.Value(0)).current;
    const curMenuAnim = useRef(new Animated.Value(0)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;

    // --- Handlers: Dropdowns ---
    /**
     * Toggles the main dropdown menu open or closed
     */
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

    /**
     * Toggles the secondary Language dropdown
     */
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

    /**
     * Toggles the secondary Currency dropdown
     */
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

    /**
     * Closes the main and secondary menus
     */
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

    // --- Handlers: General Settings ---
    /**
     * Handle language selection
     */
    const handleLangSelect = (langCode) => {
        changeLanguage(langCode);
        closeMenu();
    };

    /**
     * Handle currency selection
     */
    const handleCurSelect = (curCode) => {
        changeCurrency(curCode);
        closeMenu();
    };

    // --- Handlers: Category Editor ---
    /**
     * Handle saving changes to a category group
     */
    const handleSaveCategory = async () => {
        if (editingCategory) {
            if (newCategoryName.trim()) {
                await editCategory(editingCategory.id, newCategoryName.trim());
            }
            if (selectedIcon) {
                await editCategoryIcon(editingCategory.id, selectedIcon);
            }
            // Reset to defaults
            setEditingCategory(null);
            setNewCategoryName('');
            setSelectedIcon(null);
            setShowCategoryModal(false);
        }
    };

    // --- Interpolated Animations Computations ---
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

    // Lang submenu height
    const langHeight = langMenuAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, Object.keys(LANGUAGES).length * verticalScale(53) + verticalScale(8)],
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
        outputRange: [0, Object.keys(CURRENCIES).length * verticalScale(53) + verticalScale(8)],
    });

    const curOpacity = curMenuAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
    });

    const curRotate = curMenuAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg'],
    });

    // --- Sub-Components ---
    
    /**
     * Menu item component with stagger animation
     */
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
            <Text style={[styles.langFlag, { color: colors.text }]}>{cur.symbol}</Text>
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
                            <BlurView intensity={20} tint={isDarkMode ? "dark" : "dark"} style={styles.backdrop} />
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
                        ]}>
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
                                    <Text style={[styles.langBadgeFlag, { color: colors.text }]}>{CURRENCIES[currentCurrency].symbol}</Text>
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
                <View style={[styles.logoContainer, { backgroundColor: isDarkMode ? colors.background : colors.text }]}>
                    <Image source={require('../imgs/Logo_FWH.png')} style={styles.img} />
                    <Text style={{ color: colors.white, fontWeight: 'bold' }}>
                        <Text style={{ color: colors.accent }}>
                            Fake
                        </Text>
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
                                : colors.cardBg,
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
            <Modal
                transparent
                visible={showCategoryModal}
                animationType="fade"
                onRequestClose={() => setShowCategoryModal(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={{ flex: 1 }}
                >
                    <TouchableWithoutFeedback 
                        onPress={() => { 
                            setShowCategoryModal(false); 
                            setEditingCategory(null); 
                            setNewCategoryName(''); 
                        }}
                    >
                        <BlurView 
                            intensity={30} 
                            tint="dark" 
                            style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.8)' }]} 
                        />
                    </TouchableWithoutFeedback>

                    <View style={[styles.categoryModal, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                        <Text style={[styles.categoryModalTitle, { color: colors.text }]}>
                            {t('editCategory')}
                        </Text>
                        
                        {editingCategory ? (
                            <View>
                                <Text style={{ color: colors.textSecondary, marginBottom: 8 }}>
                                    {t('editNewName')}
                                </Text>
                                <TextInput
                                    style={[styles.categoryInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                                    value={newCategoryName}
                                    onChangeText={setNewCategoryName}
                                    autoFocus
                                    placeholderTextColor={colors.textSecondary}
                                />

                                <Text style={{ color: colors.textSecondary, marginBottom: 12, marginTop: 10 }}>
                                    {t('editIcon')}
                                </Text>
                                <View style={styles.iconGrid}>
                                    {AVAILABLE_ICONS.map((item) => (
                                        <TouchableOpacity 
                                            key={item.name}
                                            style={[
                                                styles.iconBox, 
                                                { backgroundColor: colors.background },
                                                (selectedIcon === item.name || (!selectedIcon && editingCategory.iconName === item.name)) && { borderColor: colors.accent, borderWidth: 2 }
                                            ]}
                                            onPress={() => setSelectedIcon(item.name)}
                                        >
                                            <item.Icon size={20} color={(selectedIcon === item.name || (!selectedIcon && editingCategory.iconName === item.name)) ? colors.accent : colors.gray} />
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <View style={styles.categoryActions}>
                                    <TouchableOpacity style={[styles.categoryBtn, { backgroundColor: colors.border }]} onPress={() => { setEditingCategory(null); setNewCategoryName(''); setSelectedIcon(null); }}>
                                        <Text style={{ color: colors.text, fontWeight: 'bold' }}>
                                            {t('cancel')}
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.categoryBtn, { backgroundColor: colors.accent }]} onPress={handleSaveCategory}>
                                        <Text style={{ color: colors.background, fontWeight: 'bold' }}>
                                            {t('save')}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ) : (
                            <View>
                                {categories.map(cat => (
                                    <View
                                        key={cat.id}
                                        style={[styles.categoryRow, { borderBottomColor: colors.border }]}
                                    >
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                            <View style={[styles.miniIcon, { backgroundColor: colors.accent + '15' }]}>
                                                {getIconComponent(cat.iconName, 16, colors.accent) || <Settings size={16} color={colors.accent} />}
                                            </View>
                                            <Text style={{ color: colors.text, fontSize: 16 }}>
                                                {cat.name}
                                            </Text>
                                        </View>
                                        <TouchableOpacity 
                                            onPress={() => { 
                                                setEditingCategory(cat); 
                                                setNewCategoryName(cat.name); 
                                                setSelectedIcon(cat.iconName); 
                                            }}
                                            style={{ padding: 8, backgroundColor: colors.accent + '20', borderRadius: 8 }}
                                        >
                                            <Edit3 size={16} color={colors.accent} />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                                <TouchableOpacity style={[styles.categoryCloseBtn, { backgroundColor: colors.border, marginTop: 16 }]} onPress={() => setShowCategoryModal(false)}>
                                    <Text style={{ color: colors.text, fontWeight: 'bold' }}>
                                        {t('close')}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </>
    );
}

// --- Styles ---
const styles = StyleSheet.create({
    nav: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: verticalScale(30),
        marginBottom: verticalScale(20),
        zIndex: 1000,
    },
    logoContainer: {
        paddingHorizontal: horizontalScale(15),
        paddingVertical: verticalScale(5),
        borderRadius: moderateScale(10),
        flexDirection: "row",
        alignItems: "center",
        gap: horizontalScale(10),
    },
    img: {
        width: horizontalScale(30),
        height: verticalScale(30),
    },

    // Menu toggle button
    menuButton: {
        borderRadius: moderateScale(12),
        borderWidth: 1,
        paddingHorizontal: horizontalScale(12),
        paddingVertical: verticalScale(8),
        ...CARD_SHADOW,
    },
    menuButtonInner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: horizontalScale(8),
    },
    menuButtonFlag: {
        fontSize: moderateScale(16),
    },

    // Backdrop
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },

    // Dropdown menu
    dropdownMenu: {
        position: 'absolute',
        top: verticalScale(70),
        right: horizontalScale(16),
        width: horizontalScale(260),
        borderRadius: moderateScale(16),
        borderWidth: 1,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: verticalScale(8) },
        shadowOpacity: 0.25,
        shadowRadius: moderateScale(16),
        elevation: 12,
    },

    // Menu header
    menuHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: horizontalScale(10),
        paddingHorizontal: horizontalScale(16),
        paddingVertical: verticalScale(14),
        borderBottomWidth: 1,
    },
    menuHeaderIconBg: {
        width: horizontalScale(30),
        height: verticalScale(30),
        borderRadius: moderateScale(8),
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuHeaderText: {
        fontSize: moderateScale(15),
        fontWeight: '700',
    },

    // Menu items
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: horizontalScale(16),
        paddingVertical: verticalScale(13),
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: horizontalScale(12),
    },
    menuIconContainer: {
        width: horizontalScale(34),
        height: verticalScale(34),
        borderRadius: moderateScale(10),
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuItemText: {
        fontSize: moderateScale(14),
        fontWeight: '500',
    },

    // Toggle switch
    toggleTrack: {
        width: horizontalScale(40),
        height: verticalScale(22),
        borderRadius: moderateScale(11),
        justifyContent: 'center',
    },
    toggleThumb: {
        width: horizontalScale(18),
        height: verticalScale(18),
        borderRadius: moderateScale(9),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: verticalScale(1) },
        shadowOpacity: 0.2,
        shadowRadius: moderateScale(2),
        elevation: 2,
    },

    // Language badge on menu item
    langBadgeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: horizontalScale(4),
    },
    langBadgeFlag: {
        fontSize: moderateScale(14),
    },
    langBadgeText: {
        fontSize: moderateScale(12),
        fontWeight: '500',
    },

    // Language submenu
    langSubmenu: {
        paddingHorizontal: horizontalScale(12),
        borderRadius: moderateScale(12),
        overflow: 'hidden',
        marginBottom: verticalScale(4),
    },
    langItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: horizontalScale(14),
        paddingVertical: verticalScale(12),
        gap: horizontalScale(12),
    },
    langFlag: {
        fontSize: moderateScale(20),
    },
    langName: {
        fontSize: moderateScale(14),
        fontWeight: '500',
    },

    // Check badge
    checkBadge: {
        width: horizontalScale(22),
        height: verticalScale(22),
        borderRadius: moderateScale(11),
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Category Modal
    categoryModal: {
        position: 'absolute',
        top: '15%',
        left: horizontalScale(20),
        right: horizontalScale(20),
        borderRadius: moderateScale(16),
        padding: horizontalScale(24),
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: verticalScale(4) },
        shadowOpacity: 0.3,
        shadowRadius: moderateScale(10),
        elevation: 10,
    },
    categoryModalTitle: {
        fontSize: moderateScale(18),
        fontWeight: 'bold',
        marginBottom: verticalScale(20),
        textAlign: 'center',
    },
    categoryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: verticalScale(10),
        borderBottomWidth: 1,
    },
    categoryInput: {
        borderWidth: 1,
        borderRadius: moderateScale(10),
        paddingHorizontal: horizontalScale(16),
        paddingVertical: verticalScale(10),
        fontSize: moderateScale(16),
        marginBottom: verticalScale(10),
    },
    categoryActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: horizontalScale(12),
        marginTop: verticalScale(20),
    },
    categoryBtn: {
        paddingHorizontal: horizontalScale(20),
        paddingVertical: verticalScale(10),
        borderRadius: moderateScale(10),
        minWidth: horizontalScale(80),
        alignItems: 'center',
    },
    categoryCloseBtn: {
        paddingVertical: verticalScale(12),
        borderRadius: moderateScale(10),
        alignItems: 'center',
    },
    miniIcon: {
        width: horizontalScale(32),
        height: horizontalScale(32),
        borderRadius: moderateScale(8),
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: horizontalScale(8),
        justifyContent: 'center',
    },
    iconBox: {
        width: horizontalScale(42),
        height: horizontalScale(42),
        borderRadius: moderateScale(10),
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'transparent',
    }
});
