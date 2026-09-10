"use client";
import { useCallback, useRef, useState } from "react";
import { diaryReducer, type DiaryAction } from "@/lib/diary";
import { loadDiary, saveDiary } from "@/lib/diary-storage";

export function useDiary() {
  const [state, setState] = useState(loadDiary);
  const currentDay = useRef(state.day);
  const dispatch = useCallback((action: DiaryAction) => {
    const next = diaryReducer(currentDay.current, action);
    if (next === currentDay.current) return;
    currentDay.current = next;
    // Grava antes de devolver o controle ao navegador, sem debounce ou beforeunload.
    const storageError = saveDiary(next);
    setState({ day: next, storageError });
  }, []);
  return { ...state, dispatch };
}
