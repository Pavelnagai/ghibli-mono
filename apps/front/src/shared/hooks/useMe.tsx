import { LaunchParams, postEvent, retrieveLaunchParams } from '@telegram-apps/sdk-react';
import { useAuthStore } from '../store/auth.store';
import { useEffect } from 'react';

export const useMe = () => {
  const setTelegramUser = useAuthStore((state) => state.setTelegramUser);

  useEffect(() => {
    const lp: LaunchParams = retrieveLaunchParams();
    if (lp.tgWebAppData?.user) {
      setTelegramUser(lp.tgWebAppData.user);
    }

    if (['macos', 'tdesktop', 'weba', 'web', 'webk'].includes(lp.tgWebAppPlatform)) {
      return;
    }

    postEvent('web_app_expand');
    postEvent('web_app_request_fullscreen');
    postEvent('web_app_setup_swipe_behavior', { allow_vertical_swipe: false });
  }, [setTelegramUser]);
};
