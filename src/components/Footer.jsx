import { View, TouchableOpacity, Text, StyleSheet, Animated } from "react-native"
import { useNavigation, useRoute } from '@react-navigation/native';
import { useRef, useEffect } from "react";
import { useTheme } from '../context/ThemeContext';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { CARD_SHADOW } from "../style/Theme";

const Menu = ({ icon, text, link, route, navigation, colors }) => {
    const isActive = route.name === link;
    const scaleAnim = useRef(new Animated.Value(isActive ? 1.1 : 1)).current;

    useEffect(() => {
        Animated.spring(scaleAnim, {
            toValue: isActive ? 1.1 : 1,
            friction: 4,
            tension: 100,
            useNativeDriver: true,
        }).start();
    }, [isActive]);

    return (
        <View>
            <TouchableOpacity
                style={styles.icon}
                onPress={() => navigation.navigate(link)}
            >
                <Animated.View
                    style={{
                        transform: [{ scale: scaleAnim }]
                    }}
                >
                    <FontAwesome5
                        name={icon}
                        size={16}
                        color={isActive ? colors.accent_black : colors.text}
                    />
                </Animated.View>
                {isActive && (
                    <Text style={[styles.text, { color: colors.accent_black }]}>{text}</Text>
                )}
            </TouchableOpacity>
        </View>
    )
}

export default function Footer() {
    const { colors } = useTheme();
    const navigation = useNavigation();
    const route = useRoute();

    return (
        <View style={[styles.container, { backgroundColor: colors.cardBg }]}>
            <Menu icon="home" text="หน้าแรก" link="Home" route={route} navigation={navigation} colors={colors} />
            <Menu icon="list" text="ประวัติ" link="Record" route={route} navigation={navigation} colors={colors} />
            <Menu icon="user" text="โปรไฟล์" link="Profile" route={route} navigation={navigation} colors={colors} />
            <TouchableOpacity style={[styles.add, { backgroundColor: colors.accent }]} onPress={() => navigation.navigate("AddList")}>
                <FontAwesome5
                    name="plus"
                    size={18}
                    color={colors.background}
                />
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