import {
    View,
    StyleSheet,
    TouchableOpacity,
    Image,
} from "react-native"

// components
import { useTheme } from '../context/ThemeContext';
import { usePopup } from "../context/PopupContext";

// icons
import { Sun, CircleQuestionMark } from 'lucide-react-native';

// Nav Component
export default function Nav() {
    const { colors, toggleTheme, isDarkMode } = useTheme();
    const { openPopup } = usePopup();

    return (
        <View style={styles.nav}>
            <View style={[styles.logoContainer, { backgroundColor: isDarkMode ? colors.background : colors.accent }]}>
                <Image source={require('../imgs/logoText.png')} style={styles.img} />
            </View>

            {/* Notification Button */}
            <View style={{ flexDirection: "row", gap: 10 }}>
                <TouchableOpacity onPress={toggleTheme}>
                    <Sun size={24} color={isDarkMode ? colors.accent : colors.text} />
                </TouchableOpacity>
                <TouchableOpacity onPress={openPopup}>
                    <CircleQuestionMark size={24} color={colors.text} />
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    nav: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 30,
        marginBottom: 20,
    },
    logoContainer: {
        paddingHorizontal: 15,
        paddingVertical: 5,
        borderRadius: 10,
    },
    img: {
        width: 120,
        height: 40,
    },
});
