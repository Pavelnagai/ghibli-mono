import { ImageStyle } from '@ghibli/types';

export interface StyleGenerator {
  generateStyle(imageUrl: string): Promise<string>;
  getStyleDescription(): string;
}

export interface StyleGenerationResult {
  originalImageUrl: string;
  styledImageUrl: string;
  style: ImageStyle;
  prompt: string;
}

export interface StyleGenerationResponse {
  id: string;
  url: string;
  processedImageUrl: string;
}
