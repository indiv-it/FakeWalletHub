import React, { useMemo } from "react";
import { View, Text } from "react-native";
import { PieChart } from "react-native-gifted-charts";

// --- Theme & Utils ---
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { horizontalScale, verticalScale, moderateScale } from '../utils/responsive';


/**
 * PieChartGroup Component
 * Renders an interactive donut chart with an accompanying legend list.
 * Utilizing react-native-gifted-charts.
 */
function PieChartGroup({ data, expense }) {
    // --- Contexts ---
    const { colors } = useTheme();
    const { t } = useLanguage();
    
    // --- Data Processing ---
    // Memoize the data formatting for react-native-gifted-charts to prevent unnecessary re-computations
    const pieData = useMemo(() => {
        return data?.map((item, index) => ({
            value: item.value,
            label: item.label,
            color: item.color,
            focused: true,
        })) || [];
    }, [data]);

    // --- Render Fallback ---
    if (!pieData || pieData.length === 0) {
        return (
            <View style={{ alignItems: 'center', padding: 20 }}>
                <Text style={{ color: '#888' }}>{t('noTransaction')}</Text>
            </View>
        );
    }

    // --- Render Main Content ---
    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: verticalScale(20) }}>
            
            {/* Chart Section */}
            <PieChart
                data={pieData}
                donut
                radius={moderateScale(40)}
                innerRadius={moderateScale(25)}
                innerCircleColor={colors.cardBg}
                focusOnPress
                shiftInnerRadiusX={horizontalScale(2)}
                shiftInnerRadiusY={verticalScale(2)}
            />
            
            {/* Legend Section */}
            <View style={{ marginLeft: horizontalScale(20) }}>
                {pieData.map((item, index) => (
                    <View key={index} style={{ flexDirection: 'row', alignItems: 'center', gap: horizontalScale(5), }}>
                        {/* Legend Dot */}
                        <View 
                            style={{ 
                                width: horizontalScale(10), 
                                height: horizontalScale(10), 
                                borderRadius: moderateScale(5), 
                                backgroundColor: item.color 
                            }} 
                        />
                        {/* Legend Text */}
                        <Text style={{ color: item.color, fontSize: moderateScale(11), fontWeight: 'bold' }}>
                            {item.label} : {expense[index]}%
                        </Text>
                    </View>
                ))}
            </View>
        </View>
    );
}

export default React.memo(PieChartGroup);