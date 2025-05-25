import { useMemo } from 'react';
import { retrieveLaunchParams } from '@telegram-apps/sdk-react';

export const useMobile = () => {
  const lp = retrieveLaunchParams();

  const isAndroid = useMemo(
    () => ['android', 'android_x'].includes(lp.tgWebAppPlatform),
    [lp.tgWebAppPlatform],
  );
  const isIos = useMemo(() => ['ios'].includes(lp.tgWebAppPlatform), [lp.tgWebAppPlatform]);
  const isMobile = useMemo(
    () => ['android', 'android_x', 'ios'].includes(lp.tgWebAppPlatform),
    [lp.tgWebAppPlatform],
  );

  return { isAndroid, isIos, isMobile };
};
