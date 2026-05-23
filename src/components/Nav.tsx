import { useState, useRef, useEffect, ReactNode } from "react";
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Image,
    Text,
    Animated,
    TouchableWithoutFeedback,
    Modal,
} from "react-native";
import { BlurView } from 'expo-blur';
import { horizontalScale, verticalScale, moderateScale } from "../utils/responsive";

// --- Theme & Components ---
import { useTheme } from '../context/ThemeContext';
import { usePopup } from "../context/PopupContext";
import { useLanguage, LANGUAGES } from "../context/LanguageContext";
import { useCurrency, CURRENCIES } from "../context/CurrencyContext";
import { CARD_SHADOW } from "../style/Theme";
import CategoryEditorModal from "./CategoryEditorModal";
import HowToUseModal from "./HowToUseModal";

// --- Icons ---
import {
    Sun,
    Moon,
    CircleQuestionMark,
    ChevronDown,
    Globe,
    Check,
    Banknote,
    Edit3,
} from 'lucide-react-native';

// Currencies visible in the picker UI (hide legacy cny/jpy)
const PICKER_CURRENCIES = Object.values(CURRENCIES).filter(
    c => c.code !== 'cny' && c.code !== 'jpy'
);

/**
 * Nav Component
 * The top navigation bar, featuring dropdown menus for theme, language,
 * currency settings, and the how-to-use guide. Category editing opens CategoryEditorModal.
 */
export default function Nav() {
    // --- Context Hooks ---
    const { colors, toggleTheme, isDarkMode } = useTheme();
    const { openPopup } = usePopup();
    const { currentLang, changeLanguage, t, languages } = useLanguage();
    const { currentCurrency, changeCurrency } = useCurrency();

    // --- State: Menus ---
    const [menuOpen, setMenuOpen] = useState(false);
    const [langMenuOpen, setLangMenuOpen] = useState(false);
    const [curMenuOpen, setCurMenuOpen] = useState(false);

    // --- State: Modals ---
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showHowToUseModal, setShowHowToUseModal] = useState(false);

    // --- Animation Refs ---
    // FIX (Task 5): All animations use the same driver (menuAnim useNativeDriver:true)
    // Chevron rotation is derived from menuAnim so it stays perfectly in sync.
    const menuAnim = useRef(new Animated.Value(0)).current;
    const langMenuAnim = useRef(new Animated.Value(0)).current;
    const curMenuAnim = useRef(new Animated.Value(0)).current;

    // --- Handlers: Dropdowns ---
    /**
     * Toggles the main dropdown menu open or closed.
     */
    const toggleMenu = () => {
        const next = !menuOpen;
        setMenuOpen(next);

        if (!next) {
            // FIX (Task 6): sync-reset submenu values BEFORE animating closed
            // so they don't "stick" on next open
            langMenuAnim.setValue(0);
            curMenuAnim.setValue(0);
            setLangMenuOpen(false);
            setCurMenuOpen(false);

            Animated.timing(menuAnim, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.spring(menuAnim, {
                toValue: 1,
                friction: 8,
                tension: 65,
                useNativeDriver: true,
            }).start();
        }
    };

    /**
     * Toggles the Language sub-dropdown.
     */
    const toggleLangMenu = () => {
        const next = !langMenuOpen;
        setLangMenuOpen(next);
        if (next && curMenuOpen) {
            // close currency menu
            setCurMenuOpen(false);
            Animated.timing(curMenuAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start();
        }
        Animated.timing(langMenuAnim, {
            toValue: next ? 1 : 0,
            duration: 250,
            useNativeDriver: false,
        }).start();
    };

    /**
     * Toggles the Currency sub-dropdown.
     */
    const toggleCurMenu = () => {
        const next = !curMenuOpen;
        setCurMenuOpen(next);
        if (next && langMenuOpen) {
            // close language menu
            setLangMenuOpen(false);
            Animated.timing(langMenuAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start();
        }
        Animated.timing(curMenuAnim, {
            toValue: next ? 1 : 0,
            duration: 250,
            useNativeDriver: false,
        }).start();
    };

    /**
     * Closes the main and all secondary menus.
     */
    const closeMenu = () => {
        setMenuOpen(false);
        setLangMenuOpen(false);
        setCurMenuOpen(false);
        // FIX (Task 6): reset submenu values immediately so they don't stick
        langMenuAnim.setValue(0);
        curMenuAnim.setValue(0);

        Animated.timing(menuAnim, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
        }).start();
    };

    // --- Handlers: General Settings ---
    // FIX (Task 6): instant-reset submenu anims before close so they don't stick on reopen
    const handleLangSelect = (langCode: string) => {
        changeLanguage(langCode);
        langMenuAnim.setValue(0);
        curMenuAnim.setValue(0);
        closeMenu();
    };

    const handleCurSelect = (curCode: string) => {
        changeCurrency(curCode);
        langMenuAnim.setValue(0);
        curMenuAnim.setValue(0);
        closeMenu();
    };

    // --- Interpolated Animations ---
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

    // FIX (Task 5): Derive main chevron rotation from menuAnim (same driver thread)
    const rotateInterpolate = menuAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg'],
    });

    // Lang submenu
    const langHeight = langMenuAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, Object.keys(LANGUAGES).length * verticalScale(53) + verticalScale(8)],
    });
    const langOpacity = langMenuAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
    });
    // FIX (Task 5): lang chevron derived from langMenuAnim (same JS thread)
    const langRotate = langMenuAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg'],
    });

    // Currency submenu
    const curHeight = curMenuAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, PICKER_CURRENCIES.length * verticalScale(53) + verticalScale(8)],
    });
    const curOpacity = curMenuAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
    });
    // FIX (Task 5): cur chevron derived from curMenuAnim (same JS thread)
    const curRotate = curMenuAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg'],
    });

    // --- Sub-Components ---

    interface MenuItemProps {
        icon: ReactNode;
        label: string;
        onPress: () => void;
        rightContent?: ReactNode;
        isLast?: boolean;
        index: number;
    }

    const MenuItem = ({ icon, label, onPress, rightContent, isLast, index }: MenuItemProps) => {
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

    const LangItem = ({ lang, isSelected }: { lang: any, isSelected: boolean }) => (
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

    const CurItem = ({ cur, isSelected }: { cur: any, isSelected: boolean }) => (
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
                            <BlurView intensity={20} tint="dark" style={styles.backdrop} />
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
                                index={0}
                                icon={<Edit3 size={18} color={colors.accent} />}
                                label={t('editCategory')}
                                onPress={() => {
                                    closeMenu();
                                    setShowCategoryModal(true);
                                }}
                            />

                            {/* Theme Toggle */}
                            <MenuItem
                                index={1}
                                icon={
                                    isDarkMode
                                        ? <Moon size={18} color={colors.accent} />
                                        : <Sun size={18} color={colors.accent} />
                                }
                                label={isDarkMode ? t('darkMode') : t('lightMode')}
                                onPress={toggleTheme}
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
                                index={2}
                                icon={<Globe size={18} color={colors.accent} />}
                                label={t('language')}
                                onPress={toggleLangMenu}
                                rightContent={
                                    <View style={styles.langBadgeContainer}>
                                        <Text style={styles.langBadgeFlag}>{languages[currentLang].flag}</Text>
                                        <Text style={[styles.langBadgeText, { color: colors.textSecondary }]}>
                                            {languages[currentLang].name}
                                        </Text>
                                        {/* FIX (Task 5): derived from langMenuAnim — same JS thread as height anim */}
                                        <Animated.View style={{ transform: [{ rotate: langRotate }] }}>
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
                                        <Text style={[styles.langBadgeFlag, { color: colors.text }]}>
                                            {CURRENCIES[currentCurrency]?.symbol ?? '¥'}
                                        </Text>
                                        {/* FIX (Task 5): derived from curMenuAnim — same JS thread */}
                                        <Animated.View style={{ transform: [{ rotate: curRotate }] }}>
                                            <ChevronDown size={14} color={colors.textSecondary} />
                                        </Animated.View>
                                    </View>
                                }
                            />

                            {/* Currency Sub-menu (Task 8: only show non-legacy currencies) */}
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
                                {PICKER_CURRENCIES.map((cur) => (
                                    <CurItem
                                        key={cur.code}
                                        cur={cur}
                                        isSelected={
                                            currentCurrency === cur.code
                                            // FIX (Task 8): treat legacy cny/jpy as cny_jpy in the picker
                                            || (cur.code === 'cny_jpy' && (currentCurrency === 'cny' || currentCurrency === 'jpy'))
                                        }
                                    />
                                ))}
                            </Animated.View>

                            {/* How To Use (Task 7) */}
                            <MenuItem
                                index={4}
                                icon={<CircleQuestionMark size={18} color={colors.accent} />}
                                label={t('howToUse')}
                                onPress={() => {
                                    closeMenu();
                                    setShowHowToUseModal(true);
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
                        {/* FIX (Task 5): same menuAnim → same GPU thread = perfectly in sync */}
                        <Animated.View style={{ transform: [{ rotate: rotateInterpolate }] }}>
                            <ChevronDown size={16} color={colors.textSecondary} />
                        </Animated.View>
                    </View>
                </TouchableOpacity>
            </View>

            {/* Category Editor Modal (Task 4) */}
            <CategoryEditorModal
                visible={showCategoryModal}
                onClose={() => setShowCategoryModal(false)}
            />

            {/* How To Use Modal (Task 7) */}
            <HowToUseModal
                visible={showHowToUseModal}
                onClose={() => setShowHowToUseModal(false)}
            />
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
});
