import { ImageStyle } from '@ghibli/types';
import { api } from './api';

export const getImages = async (page: number, limit: number) => {
  const response = await api.get(`/api/images?page=${page}&limit=${limit}`);
  return response.data;
};

export const uploadImage = async (image: File, style: ImageStyle) => {
  const formData = new FormData();
  formData.append('file', image);
  formData.append('style', style);

  const response = await api.post('/api/images', formData);

  return response.data;
};

export const deleteImage = async (id: string) => {
  const response = await api.delete(`/api/images/${id}`);
  return response.data;
};

export const regenerateImage = async (id: string, style: ImageStyle) => {
  const response = await api.put(`/api/images/${id}`, { style });
  return response.data;
};
