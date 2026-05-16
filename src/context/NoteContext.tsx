import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
    initDatabase,
    getAllNotes,
    insertNote,
    updateNote,
    deleteNote as dbDeleteNote,
    NoteData,
} from '../server/database';
import { AppState } from 'react-native';

// --- Types ---
interface NoteContextValue {
    notes: NoteData[];
    isLoading: boolean;
    addNote: (data: Partial<NoteData>) => Promise<void>;
    editNote: (id: number, data: Partial<NoteData>) => Promise<void>;
    deleteNote: (id: number) => Promise<void>;
    fetchNotes: () => Promise<void>;
}

const NoteContext = createContext<NoteContextValue | undefined>(undefined);

export function NoteProvider({ children }: { children: React.ReactNode }) {
    const [notes, setNotes] = useState<NoteData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchNotes = useCallback(async (silent = false) => {
        if (!silent) {
            setIsLoading(true);
        }
        try {
            await initDatabase();
            const data = await getAllNotes();
            setNotes(data);
        } catch (error) {
            console.error('Error fetching notes:', error);
        } finally {
            if (!silent) {
                setIsLoading(false);
            }
        }
    }, []);

    // ------ Load Data on Mount ------
    useEffect(() => {
        (async () => {
            try {
                await initDatabase();
                await fetchNotes();
            } catch (error) {
                console.error('Error initializing notes:', error);
            }
        })();

        const subscription = AppState.addEventListener('change', nextAppState => {
            if (nextAppState === 'active') {
                fetchNotes(true);
            }
        });
        return () => subscription.remove();
    }, [fetchNotes]);

    const addNote = async (data: Partial<NoteData>) => {
        try {
            await insertNote(data);
            await fetchNotes();
        } catch (error) {
            console.error('Error adding note:', error);
            throw error;
        }
    };

    const editNote = async (id: number, data: Partial<NoteData>) => {
        try {
            await updateNote(id, data);
            await fetchNotes();
        } catch (error) {
            console.error('Error updating note:', error);
            throw error;
        }
    };

    const deleteNote = async (id: number) => {
        try {
            await dbDeleteNote(id);
            await fetchNotes();
        } catch (error) {
            console.error('Error deleting note:', error);
            throw error;
        }
    };

    return (
        <NoteContext.Provider value={{ notes, isLoading, addNote, editNote, deleteNote, fetchNotes }}>
            {children}
        </NoteContext.Provider>
    );
}

export function useNote(): NoteContextValue {
    const context = useContext(NoteContext);
    if (!context) {
        throw new Error('useNote must be used within a NoteProvider');
    }
    return context;
}
