import { style, globalStyle } from '@vanilla-extract/css';
import { DefaultReset, color, config } from 'folds';

export const TextViewer = style([
  DefaultReset,
  {
    height: '100%',
  },
]);

export const TextViewerHeader = style([
  DefaultReset,
  {
    paddingLeft: config.space.S200,
    paddingRight: config.space.S200,
    borderBottomWidth: config.borderWidth.B300,
    flexShrink: 0,
    gap: config.space.S200,
  },
]);

export const TextViewerContent = style([
  DefaultReset,
  {
    backgroundColor: color.Background.Container,
    color: color.Background.OnContainer,
    overflow: 'hidden',
  },
]);

export const TextViewerPre = style([
  DefaultReset,
  {
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
]);

export const TextViewerPrePadding = style({
  padding: config.space.S600,
});

// Ensure markdown-body has proper padding
globalStyle('.markdown-body', {
  padding: config.space.S600,
  boxSizing: 'border-box',
});

globalStyle('.markdown-body > *:first-child', {
  marginTop: 0,
});

globalStyle('.markdown-body > *:last-child', {
  marginBottom: 0,
});
