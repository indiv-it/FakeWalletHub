import {
    ShoppingCart,
    ShoppingBag,
    ChartColumnBig,
    PiggyBank,
    Heart,
    Home as HomeIcon,
    Car,
    Utensils,
    Gift,
    BookOpen,
    Briefcase,
    Gamepad2,
    Plane,
    Stethoscope,
    GraduationCap,
} from 'lucide-react-native';

export const AVAILABLE_ICONS = [
    { name: 'ShoppingCart', Icon: ShoppingCart },
    { name: 'ShoppingBag', Icon: ShoppingBag },
    { name: 'ChartColumnBig', Icon: ChartColumnBig },
    { name: 'PiggyBank', Icon: PiggyBank },
    { name: 'Heart', Icon: Heart },
    { name: 'HomeIcon', Icon: HomeIcon },
    { name: 'Car', Icon: Car },
    { name: 'Utensils', Icon: Utensils },
    { name: 'Gift', Icon: Gift },
    { name: 'BookOpen', Icon: BookOpen },
    { name: 'Briefcase', Icon: Briefcase },
    { name: 'Gamepad2', Icon: Gamepad2 },
    { name: 'Plane', Icon: Plane },
    { name: 'Stethoscope', Icon: Stethoscope },
    { name: 'GraduationCap', Icon: GraduationCap },
];

/** Map icon name to component for easy rendering across screens. */
export const getIconComponent = (name: string | null, size: number, color: string) => {
    const iconObj = AVAILABLE_ICONS.find(i => i.name === name);
    if (iconObj) {
        const { Icon } = iconObj;
        return <Icon size={size} color={color} />;
    }
    return null;
};
