
export interface Ingredient {
  name: string;
  category: 'Safe' | 'Caution' | 'Avoid';
  description: string;
}

export interface ProductInfo {
  name: string;
  brand: string;
  barcode: string;
  manufacturer: string;
  countryOfOrigin: string;
  isOrganic: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  healthScore: number; // 0 to 100
  healthLabel: string; // e.g., "Excelente", "Bueno", "Moderado", "Pobre"
  summary: string;
  ingredients: Ingredient[];
  positivePoints: string[];
  cautionPoints: string[];
  nutritionalHighlights: string[];
  sources: { title: string; uri: string }[];
}

export enum AppState {
  HOME = 'HOME',
  SCANNING = 'SCANNING',
  LOADING = 'LOADING',
  RESULTS = 'RESULTS',
  HISTORY = 'HISTORY'
}

export interface ScanHistoryItem {
  id: string;
  timestamp: number;
  product: ProductInfo;
  imagePreview: string;
}
