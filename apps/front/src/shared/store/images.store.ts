import { create } from 'zustand';

export enum ImageStyle {
  GHIBLI = 'ghibli',
  PIXAR = 'pixar',
  DISNEY = 'disney',
  ANIME = 'anime',
  WATERCOLOR = 'watercolor',
  OIL_PAINTING = 'oil_painting',
  PIXEL_ART = 'pixel_art',
}

export interface ProcessedImage {
  id: string;
  url: string;
  processedImageUrl: string;
  style?: ImageStyle;
}

export interface ImagesState {
  galleryImages: ProcessedImage[] | null;
  setGalleryImages: (galleryImages: ProcessedImage[]) => void;
  selectedItemImage: ProcessedImage | null;
  setSelectedItemImage: (selectedItemImage: ProcessedImage | null) => void;
  isProcessing: boolean;
  setIsProcessing: (isProcessing: boolean) => void;
  imageToGenerate: File | null;
  setImageToGenerate: (imageToGenerate: File | null) => void;
  page: number;
  setPage: (page: number) => void;
  totalPages: number;
  setTotalPages: (totalPages: number) => void;
  limit: number;
  setLimit: (limit: number) => void;
}

export const useImagesStore = create<ImagesState>((set) => ({
  galleryImages: null,
  setGalleryImages: (galleryImages) => set({ galleryImages }),
  selectedItemImage: null,
  setSelectedItemImage: (selectedItemImage) => set({ selectedItemImage }),
  isProcessing: false,
  setIsProcessing: (isProcessing) => set({ isProcessing }),
  imageToGenerate: null,
  setImageToGenerate: (imageToGenerate) => set({ imageToGenerate }),
  page: 1,
  setPage: (page) => set({ page }),
  totalPages: 1,
  setTotalPages: (totalPages) => set({ totalPages }),
  limit: 9,
  setLimit: (limit) => set({ limit }),
}));
