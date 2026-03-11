import { useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedProps, withTiming, Easing } from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const PieChartComponent = ({ income = 0, expense = 0, size = 120, onPieClick, color = "red" }) => {
    const total = income + expense;
    const { colors } = useTheme();
    const radius = size * 0.375;      // outerRadius equivalent
    const innerRadius = size * 0.25;  // innerRadius equivalent
    const strokeWidth = radius - innerRadius;
    const adjustedRadius = (radius + innerRadius) / 2;
    const circumference = 2 * Math.PI * adjustedRadius;
    const center = size / 2;

    // Calculate stroke dash for income (green) portion
    const incomeRatio = total > 0 ? income / total : 0.5;
    const incomeArc = circumference * incomeRatio;
    const expenseArc = circumference - incomeArc;

    const progress = useSharedValue(0);

    useEffect(() => {
        progress.value = 0;
        progress.value = withTiming(1, {
            duration: 1000,
            easing: Easing.out(Easing.cubic)
        });
    }, [income, expense]);

    const animatedProps = useAnimatedProps(() => {
        const animatedIncomeArc = incomeArc * progress.value;
        const animatedExpenseArc = circumference - animatedIncomeArc;
        return {
            strokeDasharray: `${animatedIncomeArc} ${animatedExpenseArc}`
        };
    });

    const content = (
        <View style={[styles.container, { width: size, height: size }]}>
            <Svg width={size} height={size} viewBox={`0 0 ${size} ${size} `} pointerEvents="none">
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
                        stroke={colors.accent}
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

    if (onPieClick) {
        return (
            <TouchableOpacity
                onPress={onPieClick}
                activeOpacity={0.7}
                style={{ width: size, height: size }}
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
