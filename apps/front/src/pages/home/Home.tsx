import { useEffect } from 'react';
import { getImages } from '@/shared/api/images';
import ReactPaginate from 'react-paginate';
import { RxUpdate } from 'react-icons/rx';
import { SkeletonGeneration } from '@/features/skeleton-generation/SkeletonGeneration';
import { Regeneration } from '@/features/regeneration/Regeneration';
import { ProcessedImage, useImagesStore } from '@/shared/store/images.store';
import { Generation } from '@/features/generation/Generation';

export const Home = () => {
  const {
    galleryImages,
    selectedItemImage,
    setSelectedItemImage,
    page,
    limit,
    totalPages,
    setPage,
    setTotalPages,
    setGalleryImages,
  } = useImagesStore();

  const urlMinio = `${import.meta.env.VITE_API_MINIO_URL}`;

  const handlePageClick = (event: { selected: number }) => {
    setPage(event.selected + 1);
  };

  useEffect(() => {
    getImages(page, limit).then((res) => {
      setTotalPages(res?.pagination?.totalPages || 1);
      setGalleryImages(res?.images || []);
    });
  }, [page]);

  return (
    <div className="p-4">
      <div className="container">
        <Generation />

        <Regeneration />

        <div className="gallery">
          <SkeletonGeneration />

          {galleryImages?.map((item: ProcessedImage) => (
            <div key={item.id} className="gallery-item">
              <div className="image-container">
                <img src={`${urlMinio}${item.url}`} alt="Original" className="gallery-image" />
                <div className="image-hover-wrapper">
                  {selectedItemImage?.id === item.id ? (
                    <div className="skeleton-image"></div>
                  ) : (
                    <img
                      src={`${urlMinio}${item.processedImageUrl}`}
                      alt="Processed"
                      className="processed-image"
                    />
                  )}
                  <button
                    className="gallery-image-replace-btn"
                    title="Перегенерировать"
                    onClick={() => setSelectedItemImage(item)}
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
      </div>{' '}
    </div>
  );
};
