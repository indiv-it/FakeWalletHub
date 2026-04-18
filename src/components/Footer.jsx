import React, { useRef, useEffect } from "react";
import { View, TouchableOpacity, Text, StyleSheet, Animated } from "react-native"
import { useNavigation, useRoute } from '@react-navigation/native';
import { horizontalScale, verticalScale, moderateScale } from '../utils/responsive';

// --- Theme & Components ---
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { CARD_SHADOW } from "../style/Theme";

// --- Icons ---
import { ChartColumnBig, ClipboardList, NotebookPen, Plus } from 'lucide-react-native';

/**
 * Menu Component (Internal)
 * Renders an individual animated menu item in the footer.
 */
const Menu = ({ icon: IconComponent, text, link, route, navigation, colors }) => {
    // --- State & Validation ---
    const isActive = route.name === link;
    const scaleAnim = useRef(new Animated.Value(isActive ? 1.1 : 1)).current;

    // --- Animation Logic ---
    useEffect(() => {
        Animated.spring(scaleAnim, {
            toValue: isActive ? 1.1 : 1,
            friction: 6,
            tension: 80,
            useNativeDriver: true,
        }).start();
    }, [isActive]);

    // Interpolate animated values
    const textOpacity = scaleAnim.interpolate({
        inputRange: [1, 1.1],
        outputRange: [0, 1],
    });

    const translateY = scaleAnim.interpolate({
        inputRange: [1, 1.1],
        outputRange: [0, 0],
    });

    // --- Render Menu Item ---
    return (
        <View>
            <TouchableOpacity
                style={styles.icon}
                onPress={() => navigation.navigate(link)}
                activeOpacity={0.7}
            >
                <Animated.View
                    style={{
                        transform: [{ scale: scaleAnim }, { translateY }],
                    }}
                >
                    {/* Dynamic Icon */}
                    <IconComponent
                        size={20}
                        color={isActive ? colors.accent : colors.text}
                    />
                </Animated.View>

                {/* Animated Text (Visible only when active) */}
                {isActive && (
                    <Animated.Text style={[styles.text, { color: colors.accent, fontWeight: 'bold', opacity: textOpacity }]}>
                        {text}
                    </Animated.Text>
                )}
            </TouchableOpacity>
        </View>
    )
}

/**
 * Footer Component
 * Main bottom navigation bar displaying core app screens and a floating action button.
 */
export default function Footer() {
    // --- Contexts & Navigation ---
    const { colors } = useTheme();
    const { t } = useLanguage();
    const navigation = useNavigation();
    const route = useRoute();

    // --- Render ---
    return (
        <View style={[styles.container, { backgroundColor: colors.cardBg }]}>
            {/* Navigation Menus */}
            <Menu icon={ChartColumnBig} text={t('home')} link="Home" route={route} navigation={navigation} colors={colors} />
            <Menu icon={ClipboardList} text={t('record')} link="Record" route={route} navigation={navigation} colors={colors} />
            <Menu icon={NotebookPen} text={t('notebook')} link="Notebook" route={route} navigation={navigation} colors={colors} />

            {/* Floating Action Button (Add) */}
            <TouchableOpacity 
                style={[styles.add, { backgroundColor: colors.accent }]} 
                onPress={() => navigation.navigate("AddList")}
            >
                <Plus size={20} color={colors.background} />
            </TouchableOpacity>
        </View>
    )
}

// --- Styles ---
const styles = StyleSheet.create({
    container: {
        bottom: verticalScale(54),
        left: 0,
        right: 0,
        alignSelf: "center",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderRadius: moderateScale(50),
        marginHorizontal: horizontalScale(20),
        height: verticalScale(60),
        paddingRight: horizontalScale(5),
        paddingLeft: horizontalScale(20),
        position: "absolute",
        borderColor: "#ffffff31",
        borderWidth: 1,
        ...CARD_SHADOW
    },
    icon: {
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: horizontalScale(50),
        height: horizontalScale(50),
    },
    text: {
        fontSize: moderateScale(10),
        marginTop: verticalScale(3),
    },
    add: {
        alignItems: "center",
        justifyContent: "center",
        borderRadius: moderateScale(50),
        width: horizontalScale(100),
        height: verticalScale(50),
    },
})