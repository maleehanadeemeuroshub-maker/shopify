import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ModalContext = createContext(null);

export function ModalProvider({ children }) {
  const [modal, setModal] = useState(null); // null | 'login' | 'signup'

  const openAuth = useCallback((mode = 'login') => setModal(mode), []);
  const closeModal = useCallback(() => setModal(null), []);

  const value = useMemo(() => ({ modal, openAuth, closeModal }), [modal, openAuth, closeModal]);

  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
}

export function useModal() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('useModal must be used within a ModalProvider');
  return ctx;
}
