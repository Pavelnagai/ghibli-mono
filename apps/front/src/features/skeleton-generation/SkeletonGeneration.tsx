import '@/app/App.css';
import { useImagesStore } from '@/shared/store/images.store';
import { useEffect, useState } from 'react';

export const SkeletonGeneration = () => {
  const { isProcessing, imageToGenerate } = useImagesStore();
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (imageToGenerate) {
      const url = URL.createObjectURL(imageToGenerate);
      setImageUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [imageToGenerate]);

  return (
    isProcessing &&
    imageUrl && (
      <div className="skeleton-container">
        <img className="skeleton-image" src={imageUrl} alt="Selected image preview" />
        <div className="skeleton-image"></div>
      </div>
    )
  );
};
