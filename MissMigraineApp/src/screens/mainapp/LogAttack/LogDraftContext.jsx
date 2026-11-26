import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

const LogDraftContext = createContext(null);

function createEmptyDraft() {
  const now = new Date();
  return {
    // Step 1
    intensity: 5,

    // Step 2
    startDateTime: now.toISOString(),
    endDateTime: null,
    stillOngoing: true,

    // Step 3
    symptoms: [],
    hasAura: false,
    auraDescription: '',

    // Step 4
    triggers: [],

    // Step 5
    medications: [],

    // Step 6
    notes: '',
  };
}

export function LogDraftProvider({ children }) {
  const [draft, setDraft] = useState(createEmptyDraft);

  const resetDraft = useCallback(() => {
    setDraft(createEmptyDraft());
  }, []);

  const updateDraft = useCallback((patch) => {
    setDraft((prev) => ({ ...prev, ...patch }));
  }, []);

  const toggleArrayField = useCallback((field, value) => {
    setDraft((prev) => {
      const list = prev[field] || [];
      const exists = list.includes(value);
      return {
        ...prev,
        [field]: exists ? list.filter((v) => v !== value) : [...list, value],
      };
    });
  }, []);

  const value = useMemo(
    () => ({ draft, updateDraft, toggleArrayField, resetDraft }),
    [draft, updateDraft, toggleArrayField, resetDraft]
  );

  return (
    <LogDraftContext.Provider value={value}>
      {children}
    </LogDraftContext.Provider>
  );
}

export function useLogDraft() {
  const ctx = useContext(LogDraftContext);
  if (!ctx) {
    throw new Error('useLogDraft must be used inside a <LogDraftProvider>');
  }
  return ctx;
}