import { View, TouchableOpacity, Text, StyleSheet, Animated } from "react-native"
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useRef, useEffect } from "react";

// components
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { CARD_SHADOW } from "../style/Theme";

// Icons
import { ChartColumnBig, ClipboardList, NotebookPen, Plus } from 'lucide-react-native';

// Components menu
const Menu = ({ icon: IconComponent, text, link, route, navigation, colors }) => {
    const isActive = route.name === link;
    const scaleAnim = useRef(new Animated.Value(isActive ? 1.1 : 1)).current;

    // Animation effect
    useEffect(() => {
        Animated.spring(scaleAnim, {
            toValue: isActive ? 1.1 : 1,
            friction: 6,
            tension: 80,
            useNativeDriver: true,
        }).start();
    }, [isActive]);

    const textOpacity = scaleAnim.interpolate({
        inputRange: [1, 1.1],
        outputRange: [0, 1],
    });

    const translateY = scaleAnim.interpolate({
        inputRange: [1, 1.1],
        outputRange: [0, 0],
    });

    // Menu item
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
                    {/* Icon */}
                    <IconComponent
                        size={20}
                        color={isActive ? colors.accent : colors.text}
                    />
                </Animated.View>

                {/* Text */}
                {isActive && (
                    <Animated.Text style={[styles.text, { color: colors.accent, fontWeight: 'bold', opacity: textOpacity }]}>{text}</Animated.Text>
                )}
            </TouchableOpacity>
        </View>
    )
}

// Footer Component
export default function Footer() {
    const { colors } = useTheme();
    const { t } = useLanguage();
    const navigation = useNavigation();
    const route = useRoute();

    // Display Items
    return (
        <View style={[styles.container, { backgroundColor: colors.cardBg }]}>

            {/* Menu */}
            <Menu icon={ChartColumnBig} text={t('home')} link="Home" route={route} navigation={navigation} colors={colors} />
            <Menu icon={ClipboardList} text={t('record')} link="Record" route={route} navigation={navigation} colors={colors} />
            <Menu icon={NotebookPen} text={t('notebook')} link="Notebook" route={route} navigation={navigation} colors={colors} />

            {/* Add Button */}
            <TouchableOpacity style={[styles.add, { backgroundColor: colors.accent }]} onPress={() => navigation.navigate("AddList")}>
                <Plus size={20} color={colors.background} />
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        bottom: 54,
        left: 0,
        right: 0,
        alignSelf: "center",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderRadius: 50,
        marginHorizontal: 20,
        height: 60,
        paddingRight: 5,
        paddingLeft: 20,
        position: "absolute",
        borderColor: "#ffffff31",
        borderWidth: 1,
        ...CARD_SHADOW
    },
    icon: {
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: 50,
        height: 50,
    },
    text: {
        fontSize: 10,
        marginTop: 3,
    },
    add: {
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 50,
        width: 85,
        height: 50,
    },
})