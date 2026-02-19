"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { COMPARE_STORAGE_KEY, MAX_COMPARE_ASSETS } from "@/domains/crypto/constants";
import type { CompareListHookValue } from "@/domains/crypto/types/compare.types";

function sanitizeCompareIds(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const uniqueIds: string[] = [];

  value.forEach((entry) => {
    if (typeof entry === "string" && !uniqueIds.includes(entry)) {
      uniqueIds.push(entry);
    }
  });

  return uniqueIds.slice(0, MAX_COMPARE_ASSETS);
}

export function useCompareList(): CompareListHookValue {
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const storedValue = window.localStorage.getItem(COMPARE_STORAGE_KEY);

    if (!storedValue) {
      setIsHydrated(true);
      return;
    }

    try {
      const parsedValue = JSON.parse(storedValue) as unknown;
      setCompareIds(sanitizeCompareIds(parsedValue));
    } catch {
      setCompareIds([]);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    window.localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(compareIds));
  }, [compareIds, isHydrated]);

  const isSelected = useCallback(
    (cryptoId: string) => compareIds.includes(cryptoId),
    [compareIds],
  );

  const addCompare = useCallback((cryptoId: string) => {
    setCompareIds((currentIds) => {
      if (currentIds.includes(cryptoId)) {
        return currentIds;
      }

      if (currentIds.length >= MAX_COMPARE_ASSETS) {
        return currentIds;
      }

      return [...currentIds, cryptoId];
    });
  }, []);

  const setSingleCompare = useCallback((cryptoId: string) => {
    setCompareIds((currentIds) => {
      if (currentIds.length === 1 && currentIds[0] === cryptoId) {
        return currentIds;
      }

      return [cryptoId];
    });
  }, []);

  const toggleCompare = useCallback((cryptoId: string) => {
    setCompareIds((currentIds) => {
      if (currentIds.includes(cryptoId)) {
        return currentIds.filter((currentId) => currentId !== cryptoId);
      }

      if (currentIds.length >= MAX_COMPARE_ASSETS) {
        return currentIds;
      }

      return [...currentIds, cryptoId];
    });
  }, []);

  const clearCompare = useCallback(() => {
    setCompareIds([]);
  }, []);

  return useMemo(
    () => ({
      compareIds,
      isHydrated,
      isSelected,
      isAtLimit: compareIds.length >= MAX_COMPARE_ASSETS,
      setSingleCompare,
      addCompare,
      toggleCompare,
      clearCompare,
    }),
    [addCompare, clearCompare, compareIds, isHydrated, isSelected, setSingleCompare, toggleCompare],
  );
}
