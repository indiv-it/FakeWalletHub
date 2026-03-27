import { View, Text } from "react-native";
import { PieChart } from "react-native-gifted-charts";
import { useTheme } from "../context/ThemeContext";

function PieChartGroup({ data }) {
    const { colors } = useTheme();
    // Transform data for react-native-gifted-charts format
    const pieData = data.map((item, index) => ({
        value: item.value,
        label: item.label,
        color: item.color,
        focused: true,
    }));

    if (!data || data.length === 0) {
        return (
            <View style={{ alignItems: 'center', padding: 20 }}>
                <Text style={{ color: '#888' }}>ไม่มีข้อมูลรายจ่าย</Text>
            </View>
        );
    }

    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 20 }}>
            <PieChart
                data={pieData}
                donut
                // showGradient
                radius={50}
                innerRadius={30}
                innerCircleColor={colors.cardBg}
                focusOnPress
                shiftInnerRadiusX={2}
                shiftInnerRadiusY={2}
            />
            <View style={{ marginLeft: 20 }}>
                {data.map((item, index) => (
                    <View key={index} style={{ flexDirection: 'row', alignItems: 'center', gap: 5, }}>
                        <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: item.color }} />
                        <Text style={{ color: item.color, fontSize: 12, fontWeight: 'bold' }}>{item.label} : 10%</Text>
                    </View>
                ))}
            </View>
        </View>
    );
}

export default PieChartGroup;