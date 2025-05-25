import { create } from 'zustand';

interface UILayerState {
  hud: boolean;
  navigation: boolean;
  personalization: boolean;
}

interface GlobalState {
  fullscreen: boolean;
  setFullscreen: (fullscreen: boolean) => void;

  UILayer: UILayerState;
  setUILayerVisibility: (layer: keyof UILayerState, isVisible: boolean) => void;
}

export const useGlobalStore = create<GlobalState>((set) => ({
  fullscreen: false,
  setFullscreen: (fullscreen) => set({ fullscreen }),

  UILayer: {
    hud: true,
    navigation: true,
    personalization: false,
  },

  setUILayerVisibility: (layer, isVisible) =>
    set((state) => ({
      UILayer: { ...state.UILayer, [layer]: isVisible },
    })),
}));
