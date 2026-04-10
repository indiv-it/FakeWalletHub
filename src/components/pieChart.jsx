import { useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedProps, withTiming, Easing } from 'react-native-reanimated';

// --- Theme & Components ---
import { useTheme } from '../context/ThemeContext';
import { moderateScale } from '../utils/responsive';


// --- Shared Animation Components ---
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/**
 * PieChartComponent
 * An animated, interactive pie chart built with SVG. Designed to show income vs expense ratio.
 */
const PieChartComponent = ({ income = 0, expense = 0, size = 120, onPieClick, color = "red", background }) => {
    // --- Contexts & Derived State ---
    const { colors } = useTheme();                          
    const scaledSize = moderateScale(size);
    const total = income + expense;                         
    
    // --- Chart Geometry Calculations ---
    const radius = scaledSize * 0.375;                      // outerRadius equivalent
    const innerRadius = scaledSize * 0.25;                  // innerRadius equivalent
    const strokeWidth = radius - innerRadius;               // Stroke width thickness
    const adjustedRadius = (radius + innerRadius) / 2;      // True radius for the SVG Circle
    const circumference = 2 * Math.PI * adjustedRadius;     // Total path length
    const center = scaledSize / 2;                          // Center coordinates

    // --- Data Ratio Calculations ---
    // Calculate stroke dash relative to income (green) portion
    const incomeRatio = total > 0 ? income / total : 0.5;
    const incomeArc = circumference * incomeRatio;
    
    // --- Animation Values ---
    const progress = useSharedValue(0);

    // --- Animation Logic ---
    useEffect(() => {
        // Reset and animate the progress value whenever data changes
        progress.value = 0;
        progress.value = withTiming(1, {
            duration: 1000,
            easing: Easing.out(Easing.cubic)
        });
    }, [income, expense]);

    // Animate the stroke dash array to draw the arc smoothly
    const animatedProps = useAnimatedProps(() => {
        const animatedIncomeArc = incomeArc * progress.value;
        return {
            strokeDasharray: `${animatedIncomeArc} ${circumference - animatedIncomeArc}`
        };
    });

    // --- Render Content ---
    const content = (
        <View style={[styles.container, { width: scaledSize, height: scaledSize }]}>
            <Svg width={scaledSize} height={scaledSize} viewBox={`0 0 ${scaledSize} ${scaledSize} `} pointerEvents="none">

                {/* Base Layer: Expense (typically red) - Full circle background */}
                <Circle
                    cx={center}
                    cy={center}
                    r={adjustedRadius}
                    stroke={color == "white" ? colors.chart : colors.red}
                    strokeWidth={strokeWidth}
                    fill="none"
                />

                {/* Top Layer: Income (typically green) - Animated partial arc */}
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

    // --- Interaction Wrapper ---
    // Make it clickable only if the onPieClick prop is provided
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

// --- Styles ---
const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default PieChartComponent;
