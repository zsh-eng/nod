// This file is based on the Tamagui docs on theming,
// which recommends setting the themes in a separate file and type validating them.
// https://tamagui.dev/docs/intro/themes

const light = {
  // Standard keys for all components
  background: '#fff',
  backgroundHover: '#f5f5f5',
  backgroundPress: '#e0e0e0',
  backgroundFocus: '#d5d5d5',
  backgroundStrong: '#ccc',
  backgroundTransparent: 'rgba(255, 255, 255, 0.5)',
  color: '#000',
  colorHover: '#111',
  colorPress: '#222',
  colorFocus: '#333',
  colorTransparent: 'rgba(0, 0, 0, 0.5)',
  borderColor: '#444',
  borderColorHover: '#555',
  borderColorFocus: '#666',
  borderColorPress: '#777',
  placeholderColor: '#888',
  outlineColor: '#999',
};

type BaseTheme = typeof light;

export const allThemes = {
  light,
} satisfies Record<string, BaseTheme>;
