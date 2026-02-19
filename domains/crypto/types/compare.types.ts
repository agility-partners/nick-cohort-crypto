export interface CompareListHookValue {
  compareIds: string[];
  isHydrated: boolean;
  isSelected: (cryptoId: string) => boolean;
  isAtLimit: boolean;
  toggleCompare: (cryptoId: string) => void;
  clearCompare: () => void;
}
