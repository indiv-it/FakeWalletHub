import { initDatabase, getAllCustomCategories, updateCustomCategory } from '../server/database';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useLanguage } from './LanguageContext';

const CategoryContext = createContext();

export const useCategory = () => {
    const context = useContext(CategoryContext);
    if (!context) {
        throw new Error('useCategory must be used within a CategoryProvider');
    }
    return context;
};

// Category IDs — these are the constant keys stored in the database
export const CATEGORY_IDS = ['essentials', 'wants', 'investment', 'savings'];

// Legacy Thai name → ID mapping for migration
export const LEGACY_CATEGORY_MAP = {
    'เงินจำเป็น': 'essentials',
    'เงินตามใจ': 'wants',
    'เงินลงทุน': 'investment',
    'เงินออม': 'savings',
    // English (in case)
    'Essentials': 'essentials',
    'Wants': 'wants',
    'Investment': 'investment',
    'Savings': 'savings',
};

export const CategoryProvider = ({ children }) => {
    const { t } = useLanguage();
    const [customNames, setCustomNames] = useState({}); // { id: customName }
    const [isCategoriesReady, setIsCategoriesReady] = useState(false);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = useCallback(async () => {
        try {
            await initDatabase();
            const rows = await getAllCustomCategories();
            const customMap = {};
            if (rows) {
                rows.forEach(r => customMap[r.id] = r.custom_name);
            }
            setCustomNames(customMap);
        } catch (e) {
            console.log("Error loading categories", e);
            setCustomNames({});
        } finally {
            setIsCategoriesReady(true);
        }
    }, []);

    // Get display name for a category: custom name > translation > id
    const getCategoryDisplayName = (categoryId) => {
        if (!categoryId) return '';
        
        // If it's a legacy Thai name, resolve to ID first
        const resolvedId = LEGACY_CATEGORY_MAP[categoryId] || categoryId;
        
        // Check if there's a custom name from DB
        if (customNames[resolvedId]) {
            return customNames[resolvedId];
        }
        
        // Use translation
        if (CATEGORY_IDS.includes(resolvedId)) {
            return t(resolvedId);
        }
        
        // Fallback: return original
        return categoryId;
    };

    // Resolve any category identifier (legacy name, translated name, or ID) to its constant ID
    const resolveCategoryId = (categoryNameOrId) => {
        if (!categoryNameOrId) return 'essentials';
        
        // Already an ID?
        if (CATEGORY_IDS.includes(categoryNameOrId)) {
            return categoryNameOrId;
        }
        
        // Legacy name?
        if (LEGACY_CATEGORY_MAP[categoryNameOrId]) {
            return LEGACY_CATEGORY_MAP[categoryNameOrId];
        }
        
        // Custom name? Check reverse map
        for (const [id, name] of Object.entries(customNames)) {
            if (name === categoryNameOrId) return id;
        }

        // Try matching current translation
        for (const id of CATEGORY_IDS) {
            if (t(id) === categoryNameOrId) return id;
        }
        
        return categoryNameOrId; // fallback
    };

    // categories array for display
    const categories = CATEGORY_IDS.map(id => ({
        id,
        name: getCategoryDisplayName(id),
    }));

    const editCategory = async (id, newName) => {
        try {
            const oldName = getCategoryDisplayName(id);
            await updateCustomCategory(id, oldName, newName);
            await loadCategories();
        } catch (e) {
            console.log("Error editing category", e);
        }
    };

    return (
        <CategoryContext.Provider value={{
            categories,
            editCategory,
            isCategoriesReady,
            loadCategories,
            getCategoryDisplayName,
            resolveCategoryId,
            CATEGORY_IDS,
        }}>
            {children}
        </CategoryContext.Provider>
    );
};
