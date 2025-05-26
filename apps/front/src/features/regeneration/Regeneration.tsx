import { deleteImage, getImage, getImages, regenerateImage } from '@/shared/api/images';
import { ProcessedImage, useImagesStore } from '@/shared/store/images.store';
import { ImageStyle } from '@/shared/types';
import { useEffect, useState } from 'react';

export const Regeneration = () => {
  const { selectedItemImage, setSelectedItemImage, page, limit, galleryImages, setGalleryImages } =
    useImagesStore();
  const [editingStyle, setEditingStyle] = useState<ImageStyle>(ImageStyle.GHIBLI);
  const [isProcessing, setIsProcessing] = useState(false);

  const deleteImageCallback = () => {
    const id = selectedItemImage?.id;
    if (!id) return;
    deleteImage(id).then(() => {
      getImages(page, limit).then((res) => {
        setGalleryImages(res.images);
        setSelectedItemImage(null);
      });
    });
  };

  const handleRegenerateConfirm = async () => {
    if (!selectedItemImage?.id) return;
    setIsProcessing(true);
    await regenerateImage(selectedItemImage?.id, editingStyle)
      .then(() => {
        getImage(selectedItemImage?.id).then((res) => {
          setGalleryImages(
            galleryImages!.map((item) =>
              item.id === selectedItemImage?.id ? (res as ProcessedImage) : item,
            ),
          );
        });
      })
      .catch((error) => {
        console.error('Error regenerating image:', error);
      })
      .finally(() => {
        setSelectedItemImage(null);
        setIsProcessing(false);
      });
  };

  useEffect(() => {
    document.body.style.overflow = selectedItemImage ? 'hidden' : 'auto';

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [selectedItemImage]);
  return (
    selectedItemImage && (
      <div className="editing-container">
        {isProcessing ? (
          <div className="skeleton-image" style={{ width: '280px', height: '280px' }}></div>
        ) : (
          <img
            src={`${import.meta.env.VITE_API_MINIO_URL}${selectedItemImage?.processedImageUrl}`}
            alt="Preview"
            className="editing-preview"
          />
        )}
        <div className="editing-form">
          <div className="style-selector">
            <select
              value={editingStyle}
              onChange={(e) => setEditingStyle(e.target.value as ImageStyle)}
              className="style-select"
            >
              {Object.values(ImageStyle).map((style) => (
                <option key={style} value={style}>
                  {style
                    .split('_')
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ')}
                </option>
              ))}
            </select>
          </div>
          <div className="editing-buttons">
            <button className="process-button" onClick={handleRegenerateConfirm}>
              Перегенерировать
            </button>
            <button className="process-button" onClick={() => setSelectedItemImage(null)}>
              Отмена
            </button>
            <button className="process-button" onClick={deleteImageCallback}>
              Удалить
            </button>
          </div>
        </div>
      </div>
    )
  );
};
