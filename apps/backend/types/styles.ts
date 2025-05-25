export enum ImageStyle {
  GHIBLI = 'ghibli',
  PIXAR = 'pixar',
  DISNEY = 'disney',
  ANIME = 'anime',
  WATERCOLOR = 'watercolor',
  OIL_PAINTING = 'oil_painting',
  PIXEL_ART = 'pixel_art',
}

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
