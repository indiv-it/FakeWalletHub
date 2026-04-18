import { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Dimensions,
    Linking,
    Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

// --- Theme & Responsiveness ---
import { horizontalScale, verticalScale, moderateScale } from '../utils/responsive';
import { COLORS } from '../style/Theme';

// --- Contexts ---
import { useLanguage, LANGUAGES } from '../context/LanguageContext';
import { useCurrency, CURRENCIES } from '../context/CurrencyContext';
import { useTheme } from '../context/ThemeContext';

// --- Icons ---
import { Check, ChevronRight, ChevronLeft, Github, Mail, Globe, Sparkles } from 'lucide-react-native';

// --- Constants ---
const { width } = Dimensions.get('window');
const GITHUB_URL = 'https://github.com/indiv-it/FakeWalletHub';
const CONTACT_EMAIL = 'indiv.company@gmail.com';

/**
 * Onboarding Screen Component
 * First-time user experience for selecting language and currency, and displaying a welcome message.
 */
export default function OnboardingScreen() {
    // --- Navigation & Context ---
    const navigation = useNavigation();
    const { currentLang, changeLanguage, t } = useLanguage();
    const { currentCurrency, changeCurrency } = useCurrency();
    const { colors, isDarkMode } = useTheme();

    // --- State ---
    const [step, setStep] = useState(0); // 0 = language/currency, 1 = welcome

    // --- Animation Refs ---
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const scaleAnim = useRef(new Animated.Value(0.95)).current;
    const logoAnim = useRef(new Animated.Value(0)).current;

    /**
     * Array of animation values for staggered card entrance
     */
    const cardAnims = useRef(
        Array.from({ length: 8 }, () => new Animated.Value(0))
    ).current;

    // --- Effects ---

    /**
     * Run initial entrance animations on mount or step change
     */
    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            }),
            Animated.timing(logoAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
        ]).start();

        // Stagger cards
        Animated.stagger(
            80,
            cardAnims.map((anim) =>
                Animated.spring(anim, {
                    toValue: 1,
                    friction: 8,
                    tension: 50,
                    useNativeDriver: true,
                })
            )
        ).start();
    }, [step]);

    // --- Handlers: Transitions & Actions ---

    /**
     * Helper to orchestrate out/in transition when navigating steps
     */
    const animateTransition = (callback) => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: -30,
                duration: 250,
                useNativeDriver: true,
            }),
        ]).start(() => {
            callback();
            
            // Reset animations for the next step
            cardAnims.forEach((a) => a.setValue(0));
            slideAnim.setValue(30);
            
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
                Animated.spring(slideAnim, {
                    toValue: 0,
                    friction: 8,
                    tension: 40,
                    useNativeDriver: true,
                }),
            ]).start();

            Animated.stagger(
                80,
                cardAnims.map((anim) =>
                    Animated.spring(anim, {
                        toValue: 1,
                        friction: 8,
                        tension: 50,
                        useNativeDriver: true,
                    })
                )
            ).start();
        });
    };

    /**
     * Proceeds to the Welcome step
     */
    const handleNext = () => {
        animateTransition(() => setStep(1));
    };

    /**
     * Finishes onboarding and navigates to Main App (Home)
     */
    const handleGetStarted = async () => {
        try {
            await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
        } catch (e) {
            console.log('Error saving onboarding status:', e);
        }
        navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }],
        });
    };

    /**
     * Opens external links like Github or Mail
     */
    const handleOpenURL = (url) => {
        Linking.openURL(url).catch((err) =>
            console.log('Error opening URL:', err)
        );
    };

    // --- Extracted Computations ---

    /**
     * Background gradient base dependent on Theme Mode
     */
    const gradientColors = isDarkMode
        ? ['#0a0a0a', '#111827', '#1a1a2e']
        : ['#e8edf5', '#f0f4ff', '#e0e8f9'];

    // --- Sub-Components ---

    /**
     * Selection Card for language or currency choice
     */
    const SelectionCard = ({ item, isSelected, onPress, index, icon }) => {
        const cardAnim = cardAnims[index] || new Animated.Value(1);
        const cardScale = cardAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.8, 1],
        });
        const cardOpacity = cardAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
        });

        return (
            <Animated.View
                style={{
                    transform: [{ scale: cardScale }],
                    opacity: cardOpacity,
                }}
            >
                <TouchableOpacity
                    style={[
                        styles.selectionCard,
                        {
                            backgroundColor: isSelected
                                ? colors.accent + '20'
                                : colors.cardBg,
                            borderColor: isSelected
                                ? colors.accent
                                : colors.border,
                            borderWidth: isSelected ? 2 : 1,
                        },
                    ]}
                    onPress={onPress}
                    activeOpacity={0.7}
                >
                    <Text style={styles.selectionIcon}>{icon}</Text>
                    <Text
                        style={[
                            styles.selectionLabel,
                            {
                                color: isSelected ? colors.accent : colors.text,
                                fontWeight: isSelected ? '700' : '500',
                            },
                        ]}
                    >
                        {item.name || item.nativeName}
                    </Text>
                    {isSelected && (
                        <View
                            style={[
                                styles.checkCircle,
                                { backgroundColor: colors.accent },
                            ]}
                        >
                            <Check size={12} color={colors.background} strokeWidth={3} />
                        </View>
                    )}
                </TouchableOpacity>
            </Animated.View>
        );
    };

    /**
     * Renders Step 0: Initial Setup for Language and Currency
     */
    const renderSetup = () => (
        <Animated.View
            style={[
                styles.content,
                {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
                },
            ]}
        >
            {/* Header / Logo */}
            <Animated.View
                style={[styles.logoContainer, { opacity: logoAnim }]}
            >
                <View style={[styles.logoCircle, { backgroundColor: colors.accent + '35' }]}>
                    <Image source={require('../imgs/Logo_FWH.png')} style={styles.logoImage} />
                </View>
                <Text style={[styles.appName, { color: colors.text }]}>
                    <Text style={{ color: colors.accent }}>Fake</Text>WalletHub
                </Text>
            </Animated.View>

            {/* Language Selection Section */}
            <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                    <Globe size={18} color={colors.accent} />
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        {t('selectLanguage')}
                    </Text>
                </View>
                <View style={styles.selectionGrid}>
                    {Object.values(LANGUAGES).map((lang, index) => (
                        <SelectionCard
                            key={lang.code}
                            item={lang}
                            isSelected={currentLang === lang.code}
                            onPress={() => changeLanguage(lang.code)}
                            index={index}
                            icon={lang.flag}
                        />
                    ))}
                </View>
            </View>

            {/* Currency Selection Section */}
            <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                    <Sparkles size={18} color={colors.accent} />
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        {t('selectCurrency')}
                    </Text>
                </View>
                <View style={styles.selectionGrid}>
                    {Object.values(CURRENCIES).map((cur, index) => (
                        <SelectionCard
                            key={cur.code}
                            item={cur}
                            isSelected={currentCurrency === cur.code}
                            onPress={() => changeCurrency(cur.code)}
                            index={index + 4}
                            icon={cur.symbol}
                        />
                    ))}
                </View>
            </View>

            {/* Next Step Action Button */}
            <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: colors.accent }]}
                onPress={handleNext}
                activeOpacity={0.8}
            >
                <Text style={[styles.primaryButtonText, { color: colors.background }]}>
                    {t('next')}
                </Text>
                <ChevronRight size={20} color={colors.background} />
            </TouchableOpacity>

            {/* Step Position Indicator */}
            <View style={styles.stepIndicator}>
                <View style={[styles.stepDot, { backgroundColor: colors.accent }]} />
                <View style={[styles.stepDot, { backgroundColor: colors.border }]} />
            </View>
        </Animated.View>
    );

    /**
     * Renders Step 1: Welcome and About Info
     */
    const renderWelcome = () => (
        <Animated.View
            style={[
                styles.content,
                styles.welcomeContent,
                {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                },
            ]}
        >
            {/* Back Button to Setup Screen */}
            <TouchableOpacity 
                style={[styles.backButton, { backgroundColor: isDarkMode ? '#ffffff15' : '#00000010' }]}
                onPress={() => animateTransition(() => setStep(0))}
            >
                <ChevronLeft size={24} color={colors.text} />
            </TouchableOpacity>

            {/* Welcome Info Wrapper */}
            <Animated.View style={[styles.welcomeHero]}>
                <View style={[styles.welcomeIconContainer, { backgroundColor: colors.accent + '15' }]}>
                    <Text style={styles.welcomeEmoji}>🎉</Text>
                </View>
                <Text style={[styles.welcomeTitle, { color: colors.text }]}>
                    {t('welcomeTitle')}
                </Text>
                <Text style={[styles.welcomeDesc, { color: colors.textSecondary }]}>
                    {t('welcomeDesc')}
                </Text>
            </Animated.View>

            {/* External App Links (Developer / GitHub) */}
            <View style={styles.linksContainer}>
                {/* 1. GitHub Card Link */}
                <Animated.View
                    style={{
                        transform: [
                            {
                                scale: (cardAnims[0] || new Animated.Value(1)).interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0.9, 1],
                                }),
                            },
                        ],
                        opacity: cardAnims[0] || 1,
                    }}
                >
                    <TouchableOpacity
                        style={[styles.linkCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
                        onPress={() => handleOpenURL(GITHUB_URL)}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.linkIconCircle, { backgroundColor: isDarkMode ? '#ffffff15' : '#00000010' }]}>
                            <Github size={22} color={colors.text} />
                        </View>
                        <View style={styles.linkTextContainer}>
                            <Text style={[styles.linkTitle, { color: colors.text }]}>{t('github')}</Text>
                            <Text style={[styles.linkSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>
                                {GITHUB_URL}
                            </Text>
                        </View>
                        <ChevronRight size={18} color={colors.textSecondary} />
                    </TouchableOpacity>
                </Animated.View>

                {/* 2. Contact Email Card Link */}
                <Animated.View
                    style={{
                        transform: [
                            {
                                scale: (cardAnims[1] || new Animated.Value(1)).interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0.9, 1],
                                }),
                            },
                        ],
                        opacity: cardAnims[1] || 1,
                    }}
                >
                    <TouchableOpacity
                        style={[styles.linkCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
                        onPress={() => handleOpenURL(`mailto:${CONTACT_EMAIL}`)}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.linkIconCircle, { backgroundColor: colors.accent + '15' }]}>
                            <Mail size={22} color={colors.accent} />
                        </View>
                        <View style={styles.linkTextContainer}>
                            <Text style={[styles.linkTitle, { color: colors.text }]}>{t('contact')}</Text>
                            <Text style={[styles.linkSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>
                                {CONTACT_EMAIL}
                            </Text>
                        </View>
                        <ChevronRight size={18} color={colors.textSecondary} />
                    </TouchableOpacity>
                </Animated.View>
            </View>

            {/* Launch Home App Button */}
            <TouchableOpacity
                style={[styles.primaryButton, styles.getStartedButton, { backgroundColor: colors.accent }]}
                onPress={handleGetStarted}
                activeOpacity={0.8}
            >
                <Sparkles size={20} color={colors.background} />
                <Text style={[styles.primaryButtonText, { color: colors.background }]}>
                    {t('getStarted')}
                </Text>
            </TouchableOpacity>

            {/* Step Position Indicator */}
            <View style={styles.stepIndicator}>
                <View style={[styles.stepDot, { backgroundColor: colors.border }]} />
                <View style={[styles.stepDot, { backgroundColor: colors.accent }]} />
            </View>
        </Animated.View>
    );

    // --- Main Screen Container Render ---
    return (
        <LinearGradient colors={gradientColors} style={styles.container}>
            {/* Background Decorative Accent Orbs */}
            <View style={[styles.glowOrb, { backgroundColor: colors.accent + '10' }]} />
            <View style={[styles.glowOrb2, { backgroundColor: colors.accent + '10' }]} />
            
            {/* Step Logic */}
            {step === 0 ? renderSetup() : renderWelcome()}
        </LinearGradient>
    );
}

// --- Styles ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    glowOrb: {
        position: 'absolute',
        width: horizontalScale(300),
        height: horizontalScale(300),
        borderRadius: moderateScale(150),
        top: -verticalScale(80),
        right: -horizontalScale(80),
    },
    glowOrb2: {
        position: 'absolute',
        width: horizontalScale(250),
        height: horizontalScale(250),
        borderRadius: moderateScale(125),
        bottom: -verticalScale(10),
        left: -horizontalScale(60),
    },
    content: {
        flex: 1,
        paddingHorizontal: horizontalScale(24),
        paddingTop: verticalScale(60),
        paddingBottom: verticalScale(30),
    },
    welcomeContent: {
        justifyContent: 'center',
        paddingTop: verticalScale(40),
    },
    backButton: {
        position: 'absolute',
        top: verticalScale(60),
        left: horizontalScale(20),
        zIndex: 10,
        padding: horizontalScale(8),
        borderRadius: moderateScale(20),
    },

    // Logo
    logoContainer: {
        alignItems: 'center',
        marginBottom: verticalScale(32),
    },
    logoCircle: {
        width: horizontalScale(72),
        height: horizontalScale(72),
        borderRadius: moderateScale(36),
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: verticalScale(12),
    },
    logoImage: {
        width: horizontalScale(44),
        height: horizontalScale(44),
    },
    appName: {
        fontSize: moderateScale(22),
        fontWeight: '800',
        letterSpacing: 0.5,
    },

    // Sections
    sectionContainer: {
        marginBottom: verticalScale(24),
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: horizontalScale(8),
        marginBottom: verticalScale(12),
    },
    sectionTitle: {
        fontSize: moderateScale(16),
        fontWeight: '700',
    },

    // Selection Grid
    selectionGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: horizontalScale(9),
    },
    selectionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: horizontalScale(16),
        paddingVertical: verticalScale(14),
        borderRadius: moderateScale(14),
        width: (width - horizontalScale(58)) / 2,
        gap: horizontalScale(10),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    selectionIcon: {
        fontSize: moderateScale(22),
        color: COLORS.accent,
    },
    selectionLabel: {
        fontSize: moderateScale(12),
        flex: 1,
    },
    checkCircle: {
        width: horizontalScale(22),
        height: horizontalScale(22),
        borderRadius: moderateScale(11),
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Buttons
    primaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: verticalScale(16),
        borderRadius: moderateScale(16),
        gap: horizontalScale(8),
        marginTop: verticalScale(20),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    getStartedButton: {
        marginTop: verticalScale(32),
    },
    primaryButtonText: {
        fontSize: moderateScale(14),
        fontWeight: '700',
    },

    // Step Indicator
    stepIndicator: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: horizontalScale(8),
        marginTop: verticalScale(20),
    },
    stepDot: {
        width: horizontalScale(8),
        height: horizontalScale(8),
        borderRadius: moderateScale(4),
    },

    // Welcome
    welcomeHero: {
        alignItems: 'center',
        marginBottom: verticalScale(40),
    },
    welcomeIconContainer: {
        width: horizontalScale(96),
        height: horizontalScale(96),
        borderRadius: moderateScale(48),
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: verticalScale(20),
    },
    welcomeEmoji: {
        fontSize: moderateScale(48),
    },
    welcomeTitle: {
        fontSize: moderateScale(28),
        fontWeight: '800',
        marginBottom: verticalScale(12),
        textAlign: 'center',
    },
    welcomeDesc: {
        fontSize: moderateScale(15),
        lineHeight: moderateScale(22),
        textAlign: 'center',
        paddingHorizontal: horizontalScale(20),
    },

    // Links
    linksContainer: {
        gap: verticalScale(12),
    },
    linkCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: horizontalScale(16),
        borderRadius: moderateScale(16),
        borderWidth: 1,
        gap: horizontalScale(14),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },
    linkIconCircle: {
        width: horizontalScale(44),
        height: horizontalScale(44),
        borderRadius: moderateScale(12),
        alignItems: 'center',
        justifyContent: 'center',
    },
    linkTextContainer: {
        flex: 1,
    },
    linkTitle: {
        fontSize: moderateScale(15),
        fontWeight: '600',
        marginBottom: verticalScale(2),
    },
    linkSubtitle: {
        fontSize: moderateScale(12),
    },
});
