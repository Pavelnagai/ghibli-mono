import '@/app/App.css';
import { useState, useRef, useEffect } from 'react';
import { deleteImage, getImages, regenerateImage, uploadImage } from '@/shared/api/images';
import ReactPaginate from 'react-paginate';
import { RxUpdate } from 'react-icons/rx';
import { ImageStyle } from '@/shared/types';

interface ProcessedImage {
  id: string;
  url: string;
  processedImageUrl: string;
  style?: ImageStyle;
}

export const Generate = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<ImageStyle>(ImageStyle.GHIBLI);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingImage, setEditingImage] = useState<ProcessedImage | null>(null);
  const [editingStyle, setEditingStyle] = useState<ImageStyle>(ImageStyle.GHIBLI);
  const [regeneratingImageId, setRegeneratingImageId] = useState<string | null>(null);
  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  const strUrlMinio = `${import.meta.env.VITE_API_MINIO_URL}`;

  const handlePageClick = (event: { selected: number }) => {
    setPage(event.selected + 1);
  };

  const fetchImages = async () => {
    await getImages(page, 9)
      .then((response) => {
        const typedResponse = response as {
          pagination: { totalPages: number };
          images: ProcessedImage[];
        };
        setTotalPages(typedResponse?.pagination?.totalPages || 1);
        setProcessedImages(typedResponse?.images || []);

        return typedResponse.images;
      })
      .catch((error) => {
        console.error('Error fetching images:', error);
      });
  };

  const handleProcessImage = async () => {
    if (!selectedImage) return;

    setIsProcessing(true);

    try {
      await uploadImage(selectedImage, selectedStyle)
        .then(() => fetchImages())
        .catch((error) => {
          console.error('Error processing image:', error);
        });
    } catch (error) {
      console.error('Error processing image:', error);
    } finally {
      setSelectedImage(null);
      setIsProcessing(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRegenerate = (image: ProcessedImage) => {
    setEditingImage(image);
    setEditingStyle(image.style ?? ImageStyle.GHIBLI);
  };

  const deleteImageCallback = (id: string) => {
    console.log(id, processedImages, 'id');
    deleteImage(id).then(() => fetchImages().then(() => setEditingImage(null)));
  };

  const handleRegenerateConfirm = async () => {
    setEditingImage(null);
    if (!editingImage?.id) return;
    setRegeneratingImageId(editingImage.id);
    await regenerateImage(editingImage?.id, editingStyle)
      .then(() =>
        fetchImages()
          .catch((error) => {
            console.error('Error regenerating image:', error);
          })
          .finally(() => setRegeneratingImageId(null)),
      )
      .catch((error) => {
        console.error('Error regenerating image:', error);
      })
      .finally(() => setRegeneratingImageId(null));
  };

  useEffect(() => {
    fetchImages();
  }, [page]);

  useEffect(() => {
    document.body.style.overflow = editingImage ? 'hidden' : 'auto';

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [editingImage]);

  return (
    <div className="container">
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
          disabled={!selectedImage || isProcessing}
          className="process-button"
        >
          {isProcessing ? 'Processing...' : 'Process Image'}
        </button>
      </div>

      {editingImage && (
        <div className="editing-container">
          <img
            src={`${strUrlMinio}${editingImage.processedImageUrl}`}
            alt="Preview"
            className="editing-preview"
          />
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
              <button className="process-button" onClick={() => setEditingImage(null)}>
                Отмена
              </button>
              <button
                className="process-button"
                onClick={() => deleteImageCallback(editingImage.id)}
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="gallery">
        {isProcessing && (
          <div className="skeleton-container">
            <img
              className="skeleton-image"
              src={selectedImage ? URL.createObjectURL(selectedImage) : ''}
              alt="Selected image preview"
            />
            <div className="skeleton-image"></div>
          </div>
        )}
        {processedImages.map((image: ProcessedImage) => (
          <div key={image.id} className="gallery-item">
            <div className="image-container">
              <img src={`${strUrlMinio}${image.url}`} alt="Original" className="gallery-image" />
              <div className="image-hover-wrapper">
                {regeneratingImageId === image.id ? (
                  <div className="skeleton-image"></div>
                ) : (
                  <img
                    src={`${strUrlMinio}${image.processedImageUrl}`}
                    alt="Processed"
                    className="processed-image"
                  />
                )}
                <button
                  className="gallery-image-replace-btn"
                  title="Перегенерировать"
                  onClick={() => handleRegenerate(image)}
                >
                  <RxUpdate />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {totalPages > 1 && (
        <div className="pagination">
          <ReactPaginate
            breakLabel="..."
            nextLabel=">>"
            onPageChange={handlePageClick}
            pageRangeDisplayed={5}
            pageCount={totalPages}
            previousLabel="<<"
            renderOnZeroPageCount={null}
            containerClassName="pagination"
            pageClassName="pagination__page"
            pageLinkClassName="pagination__link"
            previousClassName="pagination__prev"
            nextClassName="pagination__next"
            breakClassName="pagination__break"
            activeClassName="pagination__active"
            disabledClassName="pagination__disabled"
          />
        </div>
      )}
    </div>
  );
};
