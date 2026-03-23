import { createContext, useContext, useState } from "react";

const PopupContext = createContext();

export function PopupProvider({ children }) {
    const [isOpen, setIsOpen] = useState(false);

    const openPopup = () => setIsOpen(true);
    const closePopup = () => setIsOpen(false);

    return (
        <PopupContext.Provider value={{ isOpen, openPopup, closePopup }}>
            {children}
        </PopupContext.Provider>
    );
}

export const usePopup = () => useContext(PopupContext);