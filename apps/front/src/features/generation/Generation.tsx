import { getImages, uploadImage } from '@/shared/api/images';
import { ImageStyle, useImagesStore } from '@/shared/store/images.store';
import { useRef, useState } from 'react';

export const Generation = () => {
  const {
    isProcessing,
    setIsProcessing,
    imageToGenerate,
    setImageToGenerate,
    page,
    limit,
    setTotalPages,
    setGalleryImages,
  } = useImagesStore();
  const [selectedStyle, setSelectedStyle] = useState<ImageStyle>(ImageStyle.GHIBLI);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageToGenerate(file);
    }
  };

  const handleProcessImage = async () => {
    if (!imageToGenerate) return;
    setIsProcessing(true);
    uploadImage(imageToGenerate, selectedStyle)
      .then(() => {
        getImages(page, limit).then((res) => {
          setTotalPages(res?.pagination?.totalPages || 1);
          setGalleryImages(res?.images || []);
        });
      })
      .finally(() => {
        setImageToGenerate(null);
        setIsProcessing(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      });
  };

  return (
    <div className="upload-section">
      <input
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        ref={fileInputRef}
        disabled={isProcessing}
        className="file-input"
      />
      <div className="style-selector">
        <select
          value={selectedStyle}
          onChange={(e) => setSelectedStyle(e.target.value as ImageStyle)}
          className="style-select"
          disabled={isProcessing}
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
      <button
        onClick={handleProcessImage}
        disabled={!imageToGenerate || isProcessing}
        className="process-button"
      >
        {isProcessing ? 'Processing...' : 'Process Image'}
      </button>
    </div>
  );
};
