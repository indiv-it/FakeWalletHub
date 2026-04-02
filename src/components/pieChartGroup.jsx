import React, { useMemo } from "react";
import { View, Text } from "react-native";
import { PieChart } from "react-native-gifted-charts";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { horizontalScale, verticalScale, moderateScale } from '../utils/responsive';


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
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: verticalScale(20) }}>
            <PieChart
                data={pieData}
                donut
                // showGradient
                radius={moderateScale(40)}
                innerRadius={moderateScale(25)}
                innerCircleColor={colors.cardBg}
                focusOnPress
                shiftInnerRadiusX={horizontalScale(2)}
                shiftInnerRadiusY={verticalScale(2)}
            />
            <View style={{ marginLeft: horizontalScale(20) }}>
                {pieData.map((item, index) => (
                    <View key={index} style={{ flexDirection: 'row', alignItems: 'center', gap: horizontalScale(5), }}>
                        <View style={{ width: horizontalScale(10), height: horizontalScale(10), borderRadius: moderateScale(5), backgroundColor: item.color }} />
                        <Text style={{ color: item.color, fontSize: moderateScale(11), fontWeight: 'bold' }}>{item.label} : {expense[index]}%</Text>
                    </View>
                ))}
            </View>
        </View>
    );
}

export default React.memo(PieChartGroup);