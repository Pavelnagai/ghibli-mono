import {
  init as initSDK,
  backButton,
  miniApp,
  viewport,
  swipeBehavior,
  themeParams,
  initData,
  postEvent,
  isFullscreen,
  retrieveLaunchParams,
  isTMA,
} from '@telegram-apps/sdk-react';
import { useEffect } from 'react';
import { useMobile } from './useMobile';
import { useMocked } from './useMocked';
import { useGlobalStore } from '../store/global';

export const useTelegram = () => {
  const lp = retrieveLaunchParams();
  const { isMobile } = useMobile();
  const setFullscreen = useGlobalStore((state) => state.setFullscreen);
  const { isMocked } = useMocked();

  if (isTMA()) {
    console.log("It's Telegram Mini Apps");
  }

  useEffect(() => {
    initSDK({ acceptCustomStyles: true });
    initData.restore();

    // const isStageDev = import.meta.env.DEV && !window.location.hostname.includes('localhost')
    // if (isStageDev) {
    // 	// $debug.set(true)
    // 	// import('eruda').then((lib) => lib.default.init())
    // }

    if (isMocked) return;

    if (!backButton.isSupported() || !miniApp.isSupported()) {
      throw new Error('ERR_NOT_SUPPORTED');
    }

    backButton.mount();
    miniApp.mount();
    themeParams.mount();
    void viewport
      .mount()
      .then(() => {
        viewport.bindCssVars();
      })
      .catch((e) => {
        console.error('Something went wrong mounting the viewport', e);
      });

    if (swipeBehavior.isSupported()) {
      swipeBehavior.mount();
      swipeBehavior.disableVertical();
    }

    postEvent('web_app_expand');
    postEvent('web_app_setup_closing_behavior', { need_confirmation: true });

    if (isFullscreen()) setFullscreen(true);
    else if (isMobile) {
      postEvent('web_app_request_fullscreen');
      setFullscreen(true);
    }

    if (miniApp.setHeaderColor.isAvailable()) miniApp.setHeaderColor('#111119');
    miniApp.ready();
  }, [isMobile, isMocked, lp.platform, setFullscreen]);
};
