export interface CompareListHookValue {
  compareIds: string[];
  isHydrated: boolean;
  isSelected: (cryptoId: string) => boolean;
  isAtLimit: boolean;
  setSingleCompare: (cryptoId: string) => void;
  addCompare: (cryptoId: string) => void;
  toggleCompare: (cryptoId: string) => void;
  clearCompare: () => void;
}
