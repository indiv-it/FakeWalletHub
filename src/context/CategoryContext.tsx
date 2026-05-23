import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useLanguage } from './LanguageContext';
import {
    initDatabase,
    getAllCustomCategories,
    getAllCategoryGoals,
    updateCustomCategory,
    upsertCategoryGoal,
    CustomCategory,
    CategoryGoal,
} from '../server/database';

// --- Types ---
export interface CategoryItem {
    id: string;
    name: string;
    iconName: string | null;
}

interface CategoryContextValue {
    categories: CategoryItem[];
    editCategory: (id: string, newName: string) => Promise<void>;
    editCategoryIcon: (id: string, iconName: string) => Promise<void>;
    saveCategoryDetails: (id: string, newName: string, iconName: string | null) => Promise<void>;
    isCategoriesReady: boolean;
    isSaving: boolean;
    loadCategories: () => Promise<void>;
    getCategoryDisplayName: (categoryId: string) => string;
    getCategoryIconName: (categoryId: string) => string | null;
    resolveCategoryId: (categoryNameOrId: string) => string;
    CATEGORY_IDS: string[];
    categoryGoals: Record<string, CategoryGoal>;
    saveCategoryGoal: (id: string, enabled: boolean, amount: number) => Promise<void>;
    getCategoryGoal: (id: string) => CategoryGoal | null;
}

const CategoryContext = createContext<CategoryContextValue | undefined>(undefined);

export const useCategory = (): CategoryContextValue => {
    const context = useContext(CategoryContext);
    if (!context) throw new Error('useCategory must be used within a CategoryProvider');
    return context;
};

export const CATEGORY_IDS: string[] = ['essentials', 'wants', 'investment', 'savings'];

export const LEGACY_CATEGORY_MAP: Record<string, string> = {
    'เงินจำเป็น': 'essentials',
    'เงินตามใจ': 'wants',
    'เงินลงทุน': 'investment',
    'เงินออม': 'savings',
    'Essentials': 'essentials',
    'Wants': 'wants',
    'Investment': 'investment',
    'Savings': 'savings',
};

export const CategoryProvider = ({ children }: { children: React.ReactNode }) => {
    const { t } = useLanguage();
    const [customNames, setCustomNames] = useState<Record<string, string>>({});
    const [customIcons, setCustomIcons] = useState<Record<string, string>>({});
    const [isCategoriesReady, setIsCategoriesReady] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [categoryGoals, setCategoryGoals] = useState<Record<string, CategoryGoal>>({});

    useEffect(() => { loadCategories(); }, []);

    const loadCategories = useCallback(async () => {
        try {
            await initDatabase();
            const rows = await getAllCustomCategories();
            const customMap: Record<string, string> = {};
            const iconMap: Record<string, string> = {};
            if (rows) {
                rows.forEach((r: CustomCategory) => {
                    customMap[r.id] = r.custom_name;
                    if (r.icon) iconMap[r.id] = r.icon;
                });
            }
            setCustomNames(customMap);
            setCustomIcons(iconMap);
            const goals = await getAllCategoryGoals();
            const goalsMap: Record<string, CategoryGoal> = {};
            goals.forEach(g => { goalsMap[g.id] = g; });
            setCategoryGoals(goalsMap);
        } catch (e) {
            console.log('Error loading categories', e);
            setCustomNames({});
            setCustomIcons({});
        } finally {
            setIsCategoriesReady(true);
        }
    }, []);

    const getCategoryDisplayName = (categoryId: string): string => {
        if (!categoryId || categoryId === '') return t('notSpecified');
        const resolvedId = LEGACY_CATEGORY_MAP[categoryId] || categoryId;
        if (customNames[resolvedId]) return customNames[resolvedId];
        if (CATEGORY_IDS.includes(resolvedId)) return t(resolvedId);
        return categoryId;
    };

    const getCategoryIconName = (categoryId: string): string | null => {
        const resolvedId = resolveCategoryId(categoryId);
        return customIcons[resolvedId] || null;
    };

    const resolveCategoryId = (categoryNameOrId: string): string => {
        if (!categoryNameOrId || categoryNameOrId === '') return '';
        if (CATEGORY_IDS.includes(categoryNameOrId)) return categoryNameOrId;
        if (LEGACY_CATEGORY_MAP[categoryNameOrId]) return LEGACY_CATEGORY_MAP[categoryNameOrId];
        for (const [id, name] of Object.entries(customNames)) {
            if (name === categoryNameOrId) return id;
        }
        for (const id of CATEGORY_IDS) {
            if (t(id) === categoryNameOrId) return id;
        }
        return categoryNameOrId;
    };

    const categories: CategoryItem[] = CATEGORY_IDS.map(id => ({
        id,
        name: getCategoryDisplayName(id),
        iconName: customIcons[id] || null,
    }));

    const editCategory = async (id: string, newName: string) => {
        await saveCategoryDetails(id, newName, customIcons[id] ?? null);
    };

    const editCategoryIcon = async (id: string, iconName: string) => {
        setIsSaving(true);
        try {
            await updateCustomCategory(id, { icon: iconName });
            await loadCategories();
        } catch (e) {
            console.log('Error editing category icon', e);
        } finally {
            setIsSaving(false);
        }
    };

    const saveCategoryDetails = async (id: string, newName: string, iconName: string | null) => {
        setIsSaving(true);
        try {
            await updateCustomCategory(id, { customName: newName.trim(), icon: iconName });
            await loadCategories();
        } catch (e) {
            console.log('Error saving category details', e);
        } finally {
            setIsSaving(false);
        }
    };

    const saveCategoryGoal = async (id: string, enabled: boolean, amount: number) => {
        setIsSaving(true);
        try {
            await upsertCategoryGoal(id, enabled, amount);
            await loadCategories();
        } catch (e) {
            console.log('Error saving category goal', e);
        } finally {
            setIsSaving(false);
        }
    };

    const getCategoryGoal = (id: string): CategoryGoal | null => categoryGoals[id] || null;

    return (
        <CategoryContext.Provider value={{
            categories, editCategory, editCategoryIcon, saveCategoryDetails,
            isCategoriesReady, isSaving,
            loadCategories, getCategoryDisplayName, getCategoryIconName,
            resolveCategoryId, CATEGORY_IDS,
            categoryGoals, saveCategoryGoal, getCategoryGoal,
        }}>
            {children}
        </CategoryContext.Provider>
    );
};
