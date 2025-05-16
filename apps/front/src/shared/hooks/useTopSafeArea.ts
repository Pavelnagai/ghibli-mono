import { viewport } from '@telegram-apps/sdk-react';
import { useMemo, useState, useEffect } from 'react';
import { useMobile } from './useMobile';
import { useMocked } from './useMocked';
import { pxToRem } from '../utils/pxToRem';

export const useTopSafeArea = (offset = 0) => {
  const { isMobile, isAndroid } = useMobile();
  const { isFullscreenMocked } = useMocked();

  const [safeAreaInsets, setSafeAreaInsets] = useState(() => viewport.safeAreaInsets());
  const [contentSafeAreaInsets, setContentSafeAreaInsets] = useState(() =>
    viewport.contentSafeAreaInsets(),
  );

  useEffect(() => {
    const initVariables = () => {
      const root = document.documentElement;

      root.style.setProperty(
        '--safe-area-inset-top',
        `${safeAreaInsets.top + contentSafeAreaInsets.top}px`,
      );
      root.style.setProperty(
        '--safe-area-inset-bottom',
        `${safeAreaInsets.bottom + contentSafeAreaInsets.bottom}px`,
      );
      root.style.setProperty(
        '--safe-area-inset-left',
        `${safeAreaInsets.left + contentSafeAreaInsets.left}px`,
      );
      root.style.setProperty(
        '--safe-area-inset-right',
        `${safeAreaInsets.right + contentSafeAreaInsets.right}px`,
      );
    };

    const handleResize = () => {
      setSafeAreaInsets(viewport.safeAreaInsets());
      setContentSafeAreaInsets(viewport.contentSafeAreaInsets());
      initVariables();
    };

    initVariables();

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const topPx = useMemo(() => {
    const viewportSafeTop = isFullscreenMocked ? 40 : safeAreaInsets.top;
    return viewportSafeTop + contentSafeAreaInsets.top + offset;
  }, [isFullscreenMocked, safeAreaInsets.top, contentSafeAreaInsets.top, offset]);

  const topRem = useMemo(() => pxToRem(topPx), [topPx]);

  const bottomPx = useMemo(() => {
    const viewportSafeBottom = isFullscreenMocked ? 40 : safeAreaInsets.bottom;
    return viewportSafeBottom + contentSafeAreaInsets.bottom + offset;
  }, [isFullscreenMocked, safeAreaInsets.bottom, contentSafeAreaInsets.bottom, offset]);

  const bottomRem = useMemo(() => pxToRem(bottomPx), [bottomPx]);

  const desktopOffset = !isMobile && !isFullscreenMocked ? 28 : 0;
  const androidOffset = isAndroid ? 8 : 0;

  const bottomNavigationPx = useMemo(() => {
    return bottomPx + androidOffset + desktopOffset;
  }, [bottomPx, androidOffset, desktopOffset]);

  const bottomNavigationRem = useMemo(() => pxToRem(bottomNavigationPx), [bottomNavigationPx]);

  return {
    // top fullscreen offset. use pixels if you need to compute something
    topSafeAreaOffset: `${topRem}rem`,
    topSafeAreaOffsetPx: topPx,

    // if you need to use it for fixed elements then use bottomSafeAreaNavigationOffset instead
    bottomSafeAreaOffset: `${bottomRem}rem`,
    bottomSafeAreaOffsetPx: bottomPx,

    // safe bottom offset prevents from overlapping native navigation bars on mobiles
    // used for navigation component or fixed components above navigation
    // added android-specific offset to not overlay navigation bar
    // added desktop-specific offset cuz we don't have navigation bar at all
    bottomSafeAreaNavigationOffset: `${bottomNavigationRem}rem`,
    bottomSafeAreaNavigationOffsetPx: bottomNavigationPx,

    desktopOffset,
    androidOffset,
  };
};
