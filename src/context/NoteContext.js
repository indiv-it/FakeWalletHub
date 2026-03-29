import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { initDatabase, getAllNotes, insertNote, updateNote, deleteNote as dbDeleteNote } from '../server/database';
import { AppState } from 'react-native';

const NoteContext = createContext();

export function NoteProvider({ children }) {
    const [notes, setNotes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchNotes = useCallback(async () => {
        setIsLoading(true);
        try {
            await initDatabase();
            const data = await getAllNotes();
            setNotes(data);
        } catch (error) {
            console.error('Error fetching notes:', error);
        } finally {
            setIsLoading(false);
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
                fetchNotes();
            }
        });
        return () => subscription.remove();
    }, [fetchNotes]);

    const addNote = async (data) => {
        try {
            await insertNote(data);
            await fetchNotes();
        } catch (error) {
            console.error('Error adding note:', error);
            throw error; // Re-throw to handle in UI
        }
    };

    const editNote = async (id, data) => {
        try {
            await updateNote(id, data);
            await fetchNotes();
        } catch (error) {
            console.error('Error updating note:', error);
            throw error; // Re-throw to handle in UI
        }
    };

    const deleteNote = async (id) => {
        try {
            await dbDeleteNote(id);
            await fetchNotes();
        } catch (error) {
            console.error('Error deleting note:', error);
            throw error; // Re-throw to handle in UI
        }
    };

    return (
        <NoteContext.Provider value={{ notes, isLoading, addNote, editNote, deleteNote, fetchNotes }}>
            {children}
        </NoteContext.Provider>
    );
}

export function useNote() {
    return useContext(NoteContext);
}
