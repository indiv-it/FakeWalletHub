import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedProps, withTiming, Easing } from 'react-native-reanimated';
import { TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { moderateScale } from '../utils/responsive';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// --- Types ---
interface PieChartComponentProps {
    income?: number;
    expense?: number;
    size?: number;
    onPieClick?: () => void;
    color?: string;
    background?: string;
}

/**
 * PieChartComponent
 * An animated, interactive pie chart built with SVG.
 */
const PieChartComponent = ({
    income = 0, expense = 0, size = 120, onPieClick, color = "red", background
}: PieChartComponentProps) => {
    const { colors } = useTheme();
    const scaledSize = moderateScale(size);
    const total = income + expense;

    const radius = scaledSize * 0.375;
    const innerRadius = scaledSize * 0.25;
    const strokeWidth = radius - innerRadius;
    const adjustedRadius = (radius + innerRadius) / 2;
    const circumference = 2 * Math.PI * adjustedRadius;
    const center = scaledSize / 2;

    const incomeRatio = total > 0 ? income / total : 0.5;
    const incomeArc = circumference * incomeRatio;

    const progress = useSharedValue(0);

    useEffect(() => {
        progress.value = 0;
        progress.value = withTiming(1, { duration: 1000, easing: Easing.out(Easing.cubic) });
    }, [income, expense]);

    const animatedProps = useAnimatedProps(() => {
        const animatedIncomeArc = incomeArc * progress.value;
        return { strokeDasharray: `${animatedIncomeArc} ${circumference - animatedIncomeArc}` };
    });

    const content = (
        <View style={[styles.container, { width: scaledSize, height: scaledSize }]}>
            <Svg width={scaledSize} height={scaledSize} viewBox={`0 0 ${scaledSize} ${scaledSize}`} pointerEvents="none">
                <Circle cx={center} cy={center} r={adjustedRadius} stroke={color === "white" ? colors.chart : colors.red} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" />
                {total > 0 && (
                    <AnimatedCircle cx={center} cy={center} r={adjustedRadius} stroke={background} strokeWidth={strokeWidth} fill="none" animatedProps={animatedProps} strokeDashoffset={circumference * 0.25} strokeLinecap="round" />
                )}
            </Svg>
        </View>
    );

    if (onPieClick) {
        return (
            <TouchableOpacity onPress={onPieClick} activeOpacity={0.7} style={{ width: scaledSize, height: scaledSize }}>
                {content}
            </TouchableOpacity>
        );
    }
    return content;
};

const styles = StyleSheet.create({
    container: { justifyContent: 'center', alignItems: 'center' },
});

export default PieChartComponent;
