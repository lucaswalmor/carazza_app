// bootstrapStyles.js
import { StyleSheet } from 'react-native';

const theme = {
  colors: {
    primary: '#007BFF',
    secondary: '#6c757d',
    success: '#198754',
    danger: '#dc3545',
    warning: '#ffc107',
    info: '#0dcaf0',
    light: '#f8f9fa',
    dark: '#212529',
  },
  spacing: {
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
  },
};

export const bootstrap = StyleSheet.create({
  // Display
  'd-block': { display: 'flex' },
  'd-none': { display: 'none' },

  // Flex
  'd-flex': { display: 'flex' },
  'flex-column': { flexDirection: 'column' },
  'flex-row': { flexDirection: 'row' },
  'flex-wrap': { flexWrap: 'wrap' },
  'justify-content-center': { justifyContent: 'center' },
  'justify-content-between': { justifyContent: 'space-between' },
  'justify-content-evenly': { justifyContent: 'space-evenly' },

  // Grid
  row: { flexDirection: 'row', flexWrap: 'wrap' },
  'col-md-12': { width: '100%' },
  'col-md-6': { width: '50%' },

  // Containers
  container: {
    width: '100%',
    paddingHorizontal: theme.spacing[4],
  },
  'container-fluid': {
    width: '100%',
    paddingHorizontal: theme.spacing[2],
  },

  // Gap
  ...Object.fromEntries(
    [1, 2, 3, 4, 5].map(n => [`gap-${n}`, { gap: theme.spacing[n] }])
  ),

  // Text
  ...Object.fromEntries(
    Object.entries(theme.colors).map(([key]) => [
      `text-${key}`,
      { color: theme.colors[key] }
    ])
  ),
  'text-start': { textAlign: 'left' },
  'text-center': { textAlign: 'center' },
  'text-end': { textAlign: 'right' },
  'fw-bold': { fontWeight: 'bold' },

  // Buttons
  btn: {
    paddingVertical: theme.spacing[2],
    paddingHorizontal: theme.spacing[3],
    borderRadius: 4,
  },
  ...Object.fromEntries(
    Object.entries(theme.colors).map(([key]) => [
      `btn-${key}`,
      {
        backgroundColor: theme.colors[key],
        borderWidth: 1,
        borderColor: theme.colors[key],
      }
    ])
  ),
  ...Object.fromEntries(
    Object.entries(theme.colors).map(([key]) => [
      `btn-outline-${key}`,
      {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: theme.colors[key],
      }
    ])
  ),
  'btn-sm': {
    paddingVertical: theme.spacing[1],
    paddingHorizontal: theme.spacing[2],
  },

  // Width/Height
  'w-full': { width: '100%' },
  ...Object.fromEntries(
    [25, 50, 75, 100].map(n => [
      `w-${n}`,
      { width: `${n}%` }
    ])
  ),
  ...Object.fromEntries(
    [25, 50, 75, 100].map(n => [
      `h-${n}`,
      { height: `${n}%` }
    ])
  ),

  // Spacing
  ...generateSpacing('m', 'margin'),
  ...generateSpacing('mt', 'marginTop'),
  ...generateSpacing('mb', 'marginBottom'),
  ...generateSpacing('ms', 'marginStart'),
  ...generateSpacing('me', 'marginEnd'),
  ...generateSpacing('p', 'padding'),
  ...generateSpacing('pt', 'paddingTop'),
  ...generateSpacing('pb', 'paddingBottom'),
  ...generateSpacing('ps', 'paddingStart'),
  ...generateSpacing('pe', 'paddingEnd'),

  // Borders
  border: { borderWidth: 1 },
  'border-top': { borderTopWidth: 1 },
  'border-end': { borderEndWidth: 1 },
  'border-bottom': { borderBottomWidth: 1 },
  'border-start': { borderStartWidth: 1 },
  ...Object.fromEntries(
    Object.entries(theme.colors).map(([key]) => [
      `border-${key}`,
      { borderColor: theme.colors[key] }
    ])
  ),
  ...Object.fromEntries(
    [1, 2, 3, 4, 5].map(n => [
      `border-${n}`,
      { borderWidth: n }
    ])
  ),

  // Radius
  rounded: { borderRadius: 4 },
  'rounded-top': { borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  'rounded-end': { borderTopRightRadius: 4, borderBottomRightRadius: 4 },
  'rounded-bottom': { borderBottomLeftRadius: 4, borderBottomRightRadius: 4 },
  'rounded-start': { borderTopLeftRadius: 4, borderBottomLeftRadius: 4 },
  'rounded-circle': { borderRadius: 9999 },
  'rounded-pill': { borderRadius: 50 },

  // Shadows
  'shadow-sm': {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  shadow: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  'shadow-lg': {
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },

  // Background
  ...Object.fromEntries(
    Object.entries(theme.colors).map(([key]) => [
      `bg-${key}`,
      { backgroundColor: theme.colors[key] }
    ])
  ),

  // Alerts
  alert: {
    padding: theme.spacing[3],
    borderRadius: 4,
    borderWidth: 1,
  },
  ...Object.fromEntries(
    Object.entries(theme.colors).map(([key]) => [
      `alert-${key}`,
      {
        backgroundColor: `${theme.colors[key]}20`,
        borderColor: theme.colors[key],
      }
    ])
  ),
});

// Função auxiliar para gerar espaçamentos
function generateSpacing(prefix, property) {
  return Object.fromEntries(
    [1, 2, 3, 4, 5].map(n => [
      `${prefix}-${n}`,
      { [property]: theme.spacing[n] }
    ])
  );
}