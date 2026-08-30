import { useState, useCallback } from "react";
import { saveAllQuests } from "../services/db";
import type { Quest } from "../types";

export function useQuests() {
  const [quests, setQuestsState] = useState<Quest[]>([]);

  const setQuests = useCallback(
    (value: Quest[] | ((prev: Quest[]) => Quest[])) => {
      setQuestsState((prev) => {
        const next = typeof value === "function" ? value(prev) : value;
        saveAllQuests(next).catch(console.error);
        return next;
      });
    },
    []
  );

  const toggleQuest = useCallback(
    (id: string, onAwardXp?: (xp: number) => void) => {
      setQuests((prev) =>
        prev.map((q) => {
          if (q.id === id) {
            const nextDone = !q.done;
            if (nextDone && onAwardXp) {
              onAwardXp(q.xp);
            }
            return { ...q, done: nextDone };
          }
          return q;
        })
      );
    },
    [setQuests]
  );

  const autoCompleteLoggingQuest = useCallback(
    (onAwardXp?: (xp: number) => void) => {
      setQuests((prev) =>
        prev.map((q) => {
          if (q.id === "q1" && !q.done) {
            if (onAwardXp) {
              onAwardXp(q.xp);
            }
            return { ...q, done: true };
          }
          return q;
        })
      );
    },
    [setQuests]
  );

  const initQuests = useCallback((initialQuests: Quest[]) => {
    setQuestsState(initialQuests);
  }, []);

  return {
    quests,
    setQuests,
    setQuestsState,
    toggleQuest,
    autoCompleteLoggingQuest,
    initQuests,
  };
}
