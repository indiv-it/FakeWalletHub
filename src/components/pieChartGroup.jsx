import React, { useMemo } from "react";
import { View, Text } from "react-native";
import { PieChart } from "react-native-gifted-charts";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";

function PieChartGroup({ data, expense }) {
    const { colors } = useTheme();
    const { t } = useLanguage();
    // Transform data for react-native-gifted-charts format
    const pieData = useMemo(() => {
        return data?.map((item, index) => ({
            value: item.value,
            label: item.label,
            color: item.color,
            focused: true,
        })) || [];
    }, [data]);

    if (!pieData || pieData.length === 0) {
        return (
            <View style={{ alignItems: 'center', padding: 20 }}>
                <Text style={{ color: '#888' }}>{t('noTransaction')}</Text>
            </View>
        );
    }

    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 20 }}>
            <PieChart
                data={pieData}
                donut
                // showGradient
                radius={40}
                innerRadius={25}
                innerCircleColor={colors.cardBg}
                focusOnPress
                shiftInnerRadiusX={2}
                shiftInnerRadiusY={2}
            />
            <View style={{ marginLeft: 20 }}>
                {pieData.map((item, index) => (
                    <View key={index} style={{ flexDirection: 'row', alignItems: 'center', gap: 5, }}>
                        <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: item.color }} />
                        <Text style={{ color: item.color, fontSize: 11, fontWeight: 'bold' }}>{item.label} : {expense[index]}%</Text>
                    </View>
                ))}
            </View>
        </View>
    );
}

export default React.memo(PieChartGroup);