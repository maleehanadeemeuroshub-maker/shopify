import { useEffect, useRef, useState } from 'react';

function readValue(key, initialValue) {
  try {
    const raw = localStorage.getItem(key);
    if (raw !== null) return JSON.parse(raw);
  } catch {
    /* corrupt/unavailable storage — fall through to the initial value */
  }
  return typeof initialValue === 'function' ? initialValue() : initialValue;
}

/**
 * useState that stays in sync with localStorage under `key` — read once
 * (lazily) on mount, written back to storage as JSON on every change.
 */
export function useLocalStorageState(key, initialValue) {
  const [value, setValue] = useState(() => readValue(key, initialValue));
  const keyRef = useRef(key);

  useEffect(() => {
    try {
      localStorage.setItem(keyRef.current, JSON.stringify(value));
    } catch {
      /* storage full/unavailable — state stays in-memory only */
    }
  }, [value]);

  return [value, setValue];
}
