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

// Context
import { useLanguage, LANGUAGES } from '../context/LanguageContext';
import { useCurrency, CURRENCIES } from '../context/CurrencyContext';
import { useTheme } from '../context/ThemeContext';

// Icons
import { Check, ChevronRight, ChevronLeft, Github, Mail, Globe, Sparkles } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

const GITHUB_URL = 'https://github.com/';
const CONTACT_EMAIL = 'contact@fakeWalletHub.app';

export default function OnboardingScreen() {
    const navigation = useNavigation();
    const { currentLang, changeLanguage, t } = useLanguage();
    const { currentCurrency, changeCurrency, currencies } = useCurrency();
    const { colors, isDarkMode } = useTheme();

    const [step, setStep] = useState(0); // 0 = language/currency, 1 = welcome

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const scaleAnim = useRef(new Animated.Value(0.95)).current;
    const logoAnim = useRef(new Animated.Value(0)).current;

    // Card stagger animations
    const cardAnims = useRef(
        Array.from({ length: 8 }, () => new Animated.Value(0))
    ).current;

    useEffect(() => {
        // Initial entrance
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
            // Reset card anims
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

    const handleNext = () => {
        animateTransition(() => setStep(1));
    };

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

    const handleOpenURL = (url) => {
        Linking.openURL(url).catch((err) =>
            console.log('Error opening URL:', err)
        );
    };

    // Gradient colors based on theme
    const gradientColors = isDarkMode
        ? ['#0a0a0a', '#111827', '#1a1a2e']
        : ['#e8edf5', '#f0f4ff', '#e0e8f9'];

    const accentGradient = isDarkMode
        ? ['#ACF53220', '#ACF53205']
        : ['#0051ff15', '#0051ff05'];

    // Selection card component
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

    // Step 0: Language & Currency
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
            {/* Logo */}
            <Animated.View
                style={[styles.logoContainer, { opacity: logoAnim }]}
            >
                <View style={[styles.logoCircle, { backgroundColor: colors.accent + '15' }]}>
                    <Image source={require('../imgs/Logo_FWH.png')} style={styles.logoImage} />
                </View>
                <Text style={[styles.appName, { color: colors.text }]}>
                    <Text style={{ color: colors.accent }}>Fake</Text>WalletHub
                </Text>
            </Animated.View>

            {/* Language Section */}
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

            {/* Currency Section */}
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

            {/* Next Button */}
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

            {/* Step Indicator */}
            <View style={styles.stepIndicator}>
                <View style={[styles.stepDot, { backgroundColor: colors.accent }]} />
                <View style={[styles.stepDot, { backgroundColor: colors.border }]} />
            </View>
        </Animated.View>
    );

    // Step 1: Welcome
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
            {/* Back Button */}
            <TouchableOpacity 
                style={[styles.backButton, { backgroundColor: isDarkMode ? '#ffffff15' : '#00000010' }]}
                onPress={() => animateTransition(() => setStep(0))}
            >
                <ChevronLeft size={24} color={colors.text} />
            </TouchableOpacity>

            {/* Welcome Hero */}
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

            {/* Links */}
            <View style={styles.linksContainer}>
                {/* GitHub Link */}
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

                {/* Contact Link */}
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

            {/* Get Started Button */}
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

            {/* Step Indicator */}
            <View style={styles.stepIndicator}>
                <View style={[styles.stepDot, { backgroundColor: colors.border }]} />
                <View style={[styles.stepDot, { backgroundColor: colors.accent }]} />
            </View>
        </Animated.View>
    );

    return (
        <LinearGradient colors={gradientColors} style={styles.container}>
            {/* Decorative accent glow */}
            <View style={[styles.glowOrb, { backgroundColor: colors.accent + '08' }]} />
            <View style={[styles.glowOrb2, { backgroundColor: colors.accent + '05' }]} />
            
            {step === 0 ? renderSetup() : renderWelcome()}
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    glowOrb: {
        position: 'absolute',
        width: 300,
        height: 300,
        borderRadius: 150,
        top: -80,
        right: -80,
    },
    glowOrb2: {
        position: 'absolute',
        width: 250,
        height: 250,
        borderRadius: 125,
        bottom: -60,
        left: -60,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 30,
    },
    welcomeContent: {
        justifyContent: 'center',
        paddingTop: 40,
    },
    backButton: {
        position: 'absolute',
        top: 60,
        left: 20,
        zIndex: 10,
        padding: 8,
        borderRadius: 20,
    },

    // Logo
    logoContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    logoCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    logoImage: {
        width: 44,
        height: 44,
    },
    appName: {
        fontSize: 22,
        fontWeight: '800',
        letterSpacing: 0.5,
    },

    // Sections
    sectionContainer: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
    },

    // Selection Grid
    selectionGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    selectionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 14,
        width: (width - 58) / 2,
        gap: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    selectionIcon: {
        fontSize: 22,
    },
    selectionLabel: {
        fontSize: 14,
        flex: 1,
    },
    checkCircle: {
        width: 22,
        height: 22,
        borderRadius: 11,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Buttons
    primaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 16,
        gap: 8,
        marginTop: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    getStartedButton: {
        marginTop: 32,
    },
    primaryButtonText: {
        fontSize: 17,
        fontWeight: '700',
    },

    // Step Indicator
    stepIndicator: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        marginTop: 20,
    },
    stepDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },

    // Welcome
    welcomeHero: {
        alignItems: 'center',
        marginBottom: 40,
    },
    welcomeIconContainer: {
        width: 96,
        height: 96,
        borderRadius: 48,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    welcomeEmoji: {
        fontSize: 48,
    },
    welcomeTitle: {
        fontSize: 28,
        fontWeight: '800',
        marginBottom: 12,
        textAlign: 'center',
    },
    welcomeDesc: {
        fontSize: 15,
        lineHeight: 22,
        textAlign: 'center',
        paddingHorizontal: 20,
    },

    // Links
    linksContainer: {
        gap: 12,
    },
    linkCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        gap: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },
    linkIconCircle: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    linkTextContainer: {
        flex: 1,
    },
    linkTitle: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 2,
    },
    linkSubtitle: {
        fontSize: 12,
    },
});
