import { initDatabase, getAllCustomCategories, updateCustomCategory } from '../server/database';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CategoryContext = createContext();

export const useCategory = () => {
    const context = useContext(CategoryContext);
    if (!context) {
        throw new Error('useCategory must be used within a CategoryProvider');
    }
    return context;
};

export const DEFAULT_CATEGORIES = [
    { id: 'essentials', defaultName: 'เงินจำเป็น' },
    { id: 'wants', defaultName: 'เงินตามใจ' },
    { id: 'investment', defaultName: 'เงินลงทุน' },
    { id: 'savings', defaultName: 'เงินออม' },
];

export const CategoryProvider = ({ children }) => {
    const [categories, setCategories] = useState([]);
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
            
            const updated = DEFAULT_CATEGORIES.map(c => ({
                ...c,
                name: customMap[c.id] || c.defaultName
            }));
            setCategories(updated);
        } catch (e) {
            console.log("Error loading categories", e);
            setCategories(DEFAULT_CATEGORIES.map(c => ({ ...c, name: c.defaultName })));
        } finally {
            setIsCategoriesReady(true);
        }
    }, []);

    const editCategory = async (id, newName) => {
        try {
            const currentCat = categories.find(c => c.id === id);
            await updateCustomCategory(id, currentCat?.name || currentCat?.defaultName, newName);
            await loadCategories();
        } catch (e) {
            console.log("Error editing category", e);
        }
    };

    return (
        <CategoryContext.Provider value={{ categories, editCategory, isCategoriesReady, loadCategories }}>
            {children}
        </CategoryContext.Provider>
    );
};
