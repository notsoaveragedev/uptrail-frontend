import { useCallback, useState } from "react";

const HISTORY_LIMIT = 50;

type HistoryState<Value> = {
  past: Value[];
  present: Value;
  future: Value[];
};

type Updater<Value> = (current: Value) => Value;

export function useHistory<Value extends object>(initial: Value) {
  const [history, setHistory] = useState<HistoryState<Value>>({ past: [], present: initial, future: [] });

  const set = useCallback((next: Value | Updater<Value>) => {
    setHistory(({ past, present }) => {
      const value = typeof next === "function" ? next(present) : next;
      if (value === present) return { past, present, future: [] };
      return { past: [...past, present].slice(-HISTORY_LIMIT), present: value, future: [] };
    });
  }, []);

  const undo = useCallback(() => {
    setHistory((current) => {
      const previous = current.past.at(-1);
      if (!previous) return current;
      return { past: current.past.slice(0, -1), present: previous, future: [current.present, ...current.future] };
    });
  }, []);

  const redo = useCallback(() => {
    setHistory((current) => {
      const [next, ...future] = current.future;
      if (!next) return current;
      return { past: [...current.past, current.present], present: next, future };
    });
  }, []);

  const reset = useCallback((value: Value) => setHistory({ past: [], present: value, future: [] }), []);

  return {
    state: history.present,
    set,
    undo,
    redo,
    reset,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    changeCount: history.past.length,
  };
}
