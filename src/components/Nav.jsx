import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image
} from "react-native"
import { useNavigation } from '@react-navigation/native';

// components
import { SIZES, FONTS } from '../style/Theme';
import { useTheme } from '../context/ThemeContext';

// items
import Feather from '@expo/vector-icons/Feather';

// Nav Component
export default function Nav() {
    const { colors } = useTheme();
    const navigation = useNavigation();

    return (
        <View style={styles.nav}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 15 }}>

                {/* Profile Image */}
                <TouchableOpacity 
                    onPress={() => navigation.navigate('Profile')} 
                    style={{ borderWidth: 2, borderColor: colors.accent, padding: 2, borderRadius: 50 }}
                >
                    <Image source={require('../imgs/logo.png')} style={styles.img} />
                </TouchableOpacity>

                {/* User Info */}
                <View>
                    <Text style={[styles.text, { color: colors.text }]}>Chockpipat</Text>
                    <Text style={{ color: colors.accent, fontSize: 11 }}>Test Account</Text>
                </View>
            </View>

            {/* Notification Button */}
            <TouchableOpacity onPress={() => navigation.navigate('Warn')}>
                <Feather name="bell" size={24} color={colors.text} />
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    nav: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginVertical: 30,
    },
    text: {
        fontSize: SIZES.base,
        fontWeight: FONTS.bold,
    },
    img: {
        width: 40,
        height: 40,
        borderRadius: 50,
    },
});
