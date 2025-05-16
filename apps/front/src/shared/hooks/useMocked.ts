import { retrieveLaunchParams } from '@telegram-apps/sdk-react';

declare global {
  interface Window {
    Telegram?: {
      WebApp?: never;
    };
  }
}

export const useMocked = () => {
  try {
    const isTelegramWebApp = window.Telegram?.WebApp !== undefined;

    if (!isTelegramWebApp) {
      return {
        isMocked: true,
        isFullscreenMocked: true,
      };
    }

    const lp = retrieveLaunchParams();
    const isMocked = !lp.tgWebAppPlatform || lp.tgWebAppPlatform === 'web';
    const isFullscreenMocked = isMocked;

    return {
      isMocked,
      isFullscreenMocked,
    };
  } catch (error: unknown) {
    console.error(error);
    return {
      isMocked: true,
      isFullscreenMocked: true,
    };
  }
};
