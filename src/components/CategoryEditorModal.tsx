import { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Switch,
    ScrollView,
    SafeAreaView,
} from "react-native";
import { BlurView } from 'expo-blur';
import { horizontalScale, verticalScale, moderateScale } from "../utils/responsive";

// --- Theme & Icons ---
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useCategory, CategoryItem } from '../context/CategoryContext';
import AlertPopup from "./AlertPopup";
import ScreenLoader from "./ScreenLoader";
import { AVAILABLE_ICONS, getIconComponent } from "../utils/categoryIcons";

import {
    Settings,
    Edit3,
} from 'lucide-react-native';

interface CategoryEditorModalProps {
    visible: boolean;
    onClose: () => void;
}

/**
 * CategoryEditorModal
 * Handles editing category names, icons, and savings goals.
 */
export default function CategoryEditorModal({ visible, onClose }: CategoryEditorModalProps) {
    const { colors } = useTheme();
    const { t } = useLanguage();
    const {
        categories,
        saveCategoryDetails,
        saveCategoryGoal,
        getCategoryGoal,
        isSaving,
        isCategoriesReady,
    } = useCategory();

    // --- State: Category edit ---
    const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [selectedIcon, setSelectedIcon] = useState<string | null>(null);

    // --- State: Savings Goal ---
    const [goalEnabled, setGoalEnabled] = useState(false);
    const [goalAmount, setGoalAmount] = useState('');
    const [showGoalAmountAlert, setShowGoalAmountAlert] = useState(false);

    // --- Handlers ---
    const handleEditCategoryStart = (cat: CategoryItem) => {
        setEditingCategory(cat);
        setNewCategoryName(cat.name);
        setSelectedIcon(cat.iconName);

        const goal = getCategoryGoal(cat.id);
        if (goal) {
            setGoalEnabled(goal.goal_enabled);
            setGoalAmount(goal.goal_amount > 0 ? String(goal.goal_amount) : '');
        } else {
            setGoalEnabled(false);
            setGoalAmount('');
        }
    };

    const handleSaveCategory = async () => {
        if (!editingCategory) return;

        const trimmedName = newCategoryName.trim();
        if (!trimmedName) return;

        const numAmount = parseFloat(goalAmount) || 0;
        if (goalEnabled && numAmount === 0) {
            setShowGoalAmountAlert(true);
            return;
        }

        const iconToSave = selectedIcon ?? editingCategory.iconName ?? null;
        await saveCategoryDetails(editingCategory.id, trimmedName, iconToSave);
        await saveCategoryGoal(editingCategory.id, goalEnabled, numAmount);

        resetEdit();
    };

    const resetEdit = () => {
        setEditingCategory(null);
        setNewCategoryName('');
        setSelectedIcon(null);
        setGoalEnabled(false);
        setGoalAmount('');
    };

    const handleClose = () => {
        if (isSaving) return;
        resetEdit();
        onClose();
    };

    const showLoader = !isCategoriesReady || isSaving;

    return (
        <>
            <Modal
                transparent
                visible={visible}
                animationType="fade"
                onRequestClose={handleClose}
            >
                <SafeAreaView style={styles.safeArea}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                        style={styles.keyboardView}
                    >
                        <TouchableWithoutFeedback onPress={handleClose}>
                            <BlurView
                                intensity={30}
                                tint="dark"
                                style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.8)' }]}
                            />
                        </TouchableWithoutFeedback>

                        <View
                            style={[styles.modal, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
                            onStartShouldSetResponder={() => true}
                        >
                            <ScreenLoader visible={showLoader} />

                            <Text style={[styles.modalTitle, { color: colors.text }]}>
                                {t('editCategory')}
                            </Text>

                            <ScrollView
                                showsVerticalScrollIndicator={false}
                                keyboardShouldPersistTaps="handled"
                                contentContainerStyle={styles.scrollContent}
                            >
                                {editingCategory ? (
                                    <View>
                                        <Text style={{ color: colors.textSecondary, marginBottom: 8 }}>
                                            {t('editNewName')}
                                        </Text>
                                        <TextInput
                                            style={[styles.input, {
                                                backgroundColor: colors.background,
                                                color: colors.text,
                                                borderColor: colors.border,
                                            }]}
                                            value={newCategoryName}
                                            onChangeText={setNewCategoryName}
                                            autoFocus
                                            placeholderTextColor={colors.textSecondary}
                                        />

                                        <Text style={{ color: colors.textSecondary, marginBottom: 12, marginTop: 10 }}>
                                            {t('editIcon')}
                                        </Text>
                                        <View style={styles.iconGrid}>
                                            {AVAILABLE_ICONS.map((item) => {
                                                const isSelected = selectedIcon === item.name
                                                    || (!selectedIcon && editingCategory.iconName === item.name);
                                                return (
                                                    <TouchableOpacity
                                                        key={item.name}
                                                        style={[
                                                            styles.iconBox,
                                                            { backgroundColor: colors.background },
                                                            isSelected && { borderColor: colors.accent, borderWidth: 2 },
                                                        ]}
                                                        onPress={() => setSelectedIcon(item.name)}
                                                    >
                                                        <item.Icon
                                                            size={20}
                                                            color={isSelected ? colors.accent : colors.gray}
                                                        />
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </View>

                                        <View style={[styles.goalContainer, { borderTopColor: colors.border }]}>
                                            <View style={styles.goalHeader}>
                                                <Text style={{ color: colors.text, fontWeight: 'bold' }}>
                                                    {t('savingsGoal')}
                                                </Text>
                                                <Switch
                                                    value={goalEnabled}
                                                    onValueChange={setGoalEnabled}
                                                    trackColor={{ false: colors.border, true: colors.accent + '80' }}
                                                    thumbColor={goalEnabled ? colors.accent : colors.gray}
                                                />
                                            </View>
                                            {goalEnabled && (
                                                <View style={{ marginTop: verticalScale(10) }}>
                                                    <Text style={{ color: colors.textSecondary, marginBottom: verticalScale(8) }}>
                                                        {t('savingsGoalAmount')}
                                                    </Text>
                                                    <TextInput
                                                        style={[styles.input, {
                                                            backgroundColor: colors.background,
                                                            color: colors.text,
                                                            borderColor: colors.border,
                                                        }]}
                                                        value={goalAmount}
                                                        onChangeText={setGoalAmount}
                                                        keyboardType="numeric"
                                                        placeholder="0.00"
                                                        placeholderTextColor={colors.textSecondary}
                                                    />
                                                </View>
                                            )}
                                        </View>

                                        <View style={styles.actions}>
                                            <TouchableOpacity
                                                style={[styles.btn, { backgroundColor: colors.border }]}
                                                onPress={resetEdit}
                                                disabled={isSaving}
                                            >
                                                <Text style={{ color: colors.text, fontWeight: 'bold' }}>
                                                    {t('cancel')}
                                                </Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={[styles.btn, { backgroundColor: colors.accent }]}
                                                onPress={handleSaveCategory}
                                                disabled={isSaving}
                                            >
                                                <Text style={{ color: colors.background, fontWeight: 'bold' }}>
                                                    {t('save')}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ) : (
                                    <View>
                                        {categories.map(cat => (
                                            <View
                                                key={cat.id}
                                                style={[styles.categoryRow, { borderBottomColor: colors.border }]}
                                            >
                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                                    <View style={[styles.miniIcon, { backgroundColor: colors.accent + '15' }]}>
                                                        {getIconComponent(cat.iconName, 16, colors.accent)
                                                            || <Settings size={16} color={colors.accent} />}
                                                    </View>
                                                    <Text style={{ color: colors.text, fontSize: 16 }}>
                                                        {cat.name}
                                                    </Text>
                                                </View>
                                                <TouchableOpacity
                                                    onPress={() => handleEditCategoryStart(cat)}
                                                    style={{
                                                        padding: 8,
                                                        backgroundColor: colors.accent + '20',
                                                        borderRadius: 8,
                                                    }}
                                                >
                                                    <Edit3 size={16} color={colors.accent} />
                                                </TouchableOpacity>
                                            </View>
                                        ))}
                                        <TouchableOpacity
                                            style={[styles.closeBtn, { backgroundColor: colors.border, marginTop: 16 }]}
                                            onPress={handleClose}
                                            disabled={isSaving}
                                        >
                                            <Text style={{ color: colors.text, fontWeight: 'bold' }}>
                                                {t('close')}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </ScrollView>
                        </View>
                    </KeyboardAvoidingView>
                </SafeAreaView>
            </Modal>

            {showGoalAmountAlert && (
                <AlertPopup
                    visible={showGoalAmountAlert}
                    title={t('goalAmountZeroAlert')}
                    description={t('goalAmountZeroAlertDesc')}
                    onClose={() => setShowGoalAmountAlert(false)}
                    buttonText={t('ok')}
                    type="warning"
                />
            )}
        </>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: horizontalScale(16),
        paddingVertical: verticalScale(16),
    },
    modal: {
        width: '100%',
        maxHeight: '88%',
        borderRadius: moderateScale(16),
        padding: horizontalScale(24),
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: moderateScale(10),
        elevation: 10,
    },
    scrollContent: {
        paddingBottom: verticalScale(16),
    },
    modalTitle: {
        fontSize: moderateScale(18),
        fontWeight: 'bold',
        marginBottom: verticalScale(20),
        textAlign: 'center',
    },
    input: {
        borderWidth: 1,
        borderRadius: moderateScale(10),
        paddingHorizontal: horizontalScale(16),
        paddingVertical: verticalScale(10),
        fontSize: moderateScale(16),
        marginBottom: verticalScale(10),
    },
    iconGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: horizontalScale(8),
        justifyContent: 'center',
    },
    iconBox: {
        width: horizontalScale(42),
        height: horizontalScale(42),
        borderRadius: moderateScale(10),
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    goalContainer: {
        marginTop: verticalScale(20),
        paddingTop: verticalScale(16),
        borderTopWidth: 1,
    },
    goalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: horizontalScale(12),
        marginTop: verticalScale(20),
    },
    btn: {
        paddingHorizontal: horizontalScale(20),
        paddingVertical: verticalScale(10),
        borderRadius: moderateScale(10),
        minWidth: horizontalScale(80),
        alignItems: 'center',
    },
    categoryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: verticalScale(10),
        borderBottomWidth: 1,
    },
    miniIcon: {
        width: horizontalScale(32),
        height: horizontalScale(32),
        borderRadius: moderateScale(8),
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeBtn: {
        paddingVertical: verticalScale(12),
        borderRadius: moderateScale(10),
        alignItems: 'center',
    },
});
