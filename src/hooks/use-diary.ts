"use client";
import { useReducer } from "react";
import { diaryReducer, localDate } from "@/lib/diary";

export function useDiary() {
  const [day, dispatch] = useReducer(diaryReducer, undefined, () => ({
    date: localDate(),
    meals: [],
  }));
  return { day, dispatch };
}
