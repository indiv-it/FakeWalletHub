import { useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedProps, withTiming, Easing } from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import { moderateScale } from '../utils/responsive';


// Animated Circle Component
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// Pie Chart Component
const PieChartComponent = ({ income = 0, expense = 0, size = 120, onPieClick, color = "red", background }) => {
    const scaledSize = moderateScale(size);
    const total = income + expense;                         // Total amount
    const { colors } = useTheme();                          // Theme colors
    const radius = scaledSize * 0.375;                            // outerRadius equivalent
    const innerRadius = scaledSize * 0.25;                        // innerRadius equivalent
    const strokeWidth = radius - innerRadius;               // Stroke width
    const adjustedRadius = (radius + innerRadius) / 2;      // Adjusted radius
    const circumference = 2 * Math.PI * adjustedRadius;     // Circumference
    const center = scaledSize / 2;                                // Center of the pie chart

    // Calculate stroke dash for income (green) portion
    const incomeRatio = total > 0 ? income / total : 0.5;
    const incomeArc = circumference * incomeRatio;
    const progress = useSharedValue(0);

    // Animate the pie chart
    useEffect(() => {
        progress.value = 0;
        progress.value = withTiming(1, {
            duration: 1000,
            easing: Easing.out(Easing.cubic)
        });
    }, [income, expense]);

    // Animate the stroke dash
    const animatedProps = useAnimatedProps(() => {
        const animatedIncomeArc = incomeArc * progress.value;
        return {
            strokeDasharray: `${animatedIncomeArc} ${circumference - animatedIncomeArc}`
        };
    });

    // Render the pie chart
    const content = (
        <View style={[styles.container, { width: scaledSize, height: scaledSize }]}>
            <Svg width={scaledSize} height={scaledSize} viewBox={`0 0 ${scaledSize} ${scaledSize} `} pointerEvents="none">

                {/* Expense (red) - full circle background */}
                <Circle
                    cx={center}
                    cy={center}
                    r={adjustedRadius}
                    stroke={color == "white" ? colors.chart : colors.red}
                    strokeWidth={strokeWidth}
                    fill="none"
                />

                {/* Income (green) - partial arc on top */}
                {total > 0 && (
                    <AnimatedCircle
                        cx={center}
                        cy={center}
                        r={adjustedRadius}
                        stroke={background}
                        strokeWidth={strokeWidth}
                        fill="none"
                        animatedProps={animatedProps}
                        strokeDashoffset={circumference * 0.25}
                        strokeLinecap="butt"
                    />
                )}
            </Svg>
        </View>
    );

    // Handle click event
    if (onPieClick) {
        return (
            <TouchableOpacity
                onPress={onPieClick}
                activeOpacity={0.7}
                style={{ width: scaledSize, height: scaledSize }}
            >
                {content}
            </TouchableOpacity>
        );
    }

    return content;
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default PieChartComponent;
