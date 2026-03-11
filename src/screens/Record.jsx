import { View, Text, StyleSheet, TouchableOpacity, FlatList } from "react-native"
import Footer from "../components/Footer"
import { useState } from "react"
import { COLORS, SIZES, FONTS, } from '../style/Theme';

export default function History() {

    const [actionButton, setActionButton] = useState(null)
    const [popupList, setPopupList] = useState(null)

    const renderItems = () => {
        return (
            <TouchableOpacity
                onPress={() => { setActionButton(popupList?.id === item.id ? null : item) }}
                style={styles.listbox}
            >
                {/* List */}
                <View>
                    <View style={styles.list_textHead}>
                        <Text style={styles.textMoney}>+00.00 ฿</Text>
                        <Text style={styles.textList}>รายรับ</Text>
                    </View>
                    <View style={styles.list_text}>
                        <Text style={styles.textAbout}>00/00/0000</Text>
                        <Text style={styles.textGroup}>หมวดหมู่</Text>
                    </View>
                    <Text style={styles.textAbout}>ชื่อรายการ</Text>
                </View>
                <View style={styles.listLogo}></View>

                {/* popupList */}
                {selectedItem?.id === item.id && (
                    <View style={styles.popupList}>
                        <TouchableOpacity>
                            <Text>แก้ไข</Text>
                        </TouchableOpacity>
                        <TouchableOpacity>
                            <Text>ลบ</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </TouchableOpacity>
        )
    }

    return (
        <View style={styles.containner}>
            <Text style={styles.textHeader}>ประวัติ</Text>

            {/* list */}
            <FlatList
                data={[]}
                renderItem={renderItems}
                keyExtractor={(item) => item.id}
            />

            <Footer />
        </View>
    )
}

const styles = StyleSheet.create({
    containner: {
        flex: 1,
        alignItems: "center",
        padding: 20,
    },
    textHeader: {
        color: COLORS.white,
        fontSize: SIZES.xl,
        fontWeight: FONTS.bold,
        marginVertical: 30,
    },
    listbox: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: COLORS.cardBg,
        borderRadius: 10,
        width: "100%",
        paddingVertical: 10,
        paddingLeft: 20,
        paddingRight: 10,
        borderLeftColor: COLORS.accent,
        borderLeftWidth: 5,
    },
    list_textHead: {
        flexDirection: "row",
        alignItems: "center",
    },
    textMoney: {
        color: COLORS.accent,
        fontSize: SIZES.sm,
        fontWeight: FONTS.bold,
    },
    textList: {
        color: COLORS.white,
        fontSize: SIZES.xs,
        fontWeight: FONTS.semibold,
        marginLeft: 10,
    },
    list_text: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 10,
    },
    textAbout: {
        color: COLORS.background_White,
        fontSize: SIZES.xs,
        fontWeight: FONTS.regular,
        marginTop: 5,
    },
    textGroup: {
        color: COLORS.white,
        fontSize: SIZES.xs,
        fontWeight: FONTS.semibold,
    },
    listLogo: {
        width: 55,
        height: 55,
        backgroundColor: COLORS.accent,
        borderRadius: 50,
    },
    popupList: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 10,
        backgroundColor: COLORS.cardBg,
        borderRadius: 10,
        padding: 10,
    },
})