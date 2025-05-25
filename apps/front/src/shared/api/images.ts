import { ImageStyle } from '@/shared/types';
import { client } from './client';

export const getImages = async (page: number, limit: number) => {
  const response = await client.images.$get({ query: { page, limit } });
  return response.json();
};

export const getImage = async (id: string) => {
  const response = await (client as any).images[':id'].$get({ param: { id } });
  return response.json();
};

export const uploadImage = async (image: File, style: ImageStyle) => {
  const formData = new FormData();
  formData.append('file', image);
  formData.append('style', style);

  await fetch(`${import.meta.env.VITE_API_URL}/api/images`, {
    method: 'POST',
    body: formData,
  }).then((res) => {
    return res.json();
  });
};

export const deleteImage = async (id: string) => {
  const response = await (client as any).images[':id'].$delete({ param: { id } });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Image not found');
    }
    throw new Error(`Failed to delete image: ${response.statusText}`);
  }

  return response.json();
};

export const regenerateImage = async (id: string, style: ImageStyle) => {
  const response = await (client as any).images[':id'].$put({
    param: { id },
    json: { style },
  });
  return response.json();
};
