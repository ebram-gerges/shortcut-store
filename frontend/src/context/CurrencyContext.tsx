import React, { createContext, useContext } from 'react';

export type Currency = 'EGP' | 'USD';
export interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
}
export const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const useCurrency = () => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within a CurrencyProvider');
  return ctx;
}; 