import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image
} from "react-native"
import { useNavigation } from '@react-navigation/native';
import { SIZES, FONTS, COLORS } from '../style/Theme';
import { useTheme } from '../context/ThemeContext';
import Feather from '@expo/vector-icons/Feather';

export default function Nav() {
    const { colors } = useTheme();
    const navigation = useNavigation();

    return (
        <View style={styles.nav}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 15 }}>
                <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={{borderWidth: 2, borderColor: colors.accent, padding: 2, borderRadius: 50}}>
                    <Image source={require('../../assets/icon.png')} style={styles.img} />
                </TouchableOpacity>
                <View>
                    <Text style={[styles.text, { color: colors.text }]}>Chockpipat</Text>
                    <Text style={{ color: colors.accent_black, fontSize: 11 }}>Test Account</Text>
                </View>
            </View>

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
