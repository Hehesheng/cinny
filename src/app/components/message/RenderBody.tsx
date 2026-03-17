import React, { ReactElement } from 'react';
import parse, { HTMLReactParserOptions } from 'html-react-parser';
import Linkify from 'linkify-react';
import { Opts } from 'linkifyjs';
import { marked } from 'marked';
import { MessageEmptyContent } from './content';
import { sanitizeCustomHtml } from '../../utils/sanitize';
import { highlightText, scaleSystemEmoji } from '../../plugins/react-custom-html-parser';
import { RenderMode } from '../../state/messageRenderMode';

type RenderBodyProps = {
  body: string;
  customBody?: string;
  renderMode?: RenderMode;

  highlightRegex?: RegExp;
  htmlReactParserOptions: HTMLReactParserOptions;
  linkifyOpts: Opts;
};

const hasMarkdownFeatures = (text: string): boolean => {
  if (text.startsWith('#!')) return false;

  try {
    const tokens = marked.lexer(text);
    for (const token of tokens) {
      switch (token.type) {
        case 'heading':
        case 'table':
        case 'list':
        case 'blockquote':
        case 'code':
          return true;
        case 'paragraph':
          if ('tokens' in token && token.tokens) {
            for (const inlineToken of token.tokens) {
              if (
                (inlineToken as { type: string }).type === 'strong' ||
                (inlineToken as { type: string }).type === 'em' ||
                (inlineToken as { type: string }).type === 'codespan' ||
                (inlineToken as { type: string }).type === 'link'
              ) {
                return true;
              }
            }
          }
          break;
      }
    }
    return false;
  } catch {
    return false;
  }
};

export function RenderBody({
  body,
  customBody,
  renderMode = 'html',
  highlightRegex,
  htmlReactParserOptions,
  linkifyOpts,
}: RenderBodyProps): ReactElement | null {
  if (body === '') return <MessageEmptyContent />;

  if (renderMode === 'raw_body') {
    return (
      <Linkify options={linkifyOpts}>
        {highlightRegex
          ? highlightText(highlightRegex, scaleSystemEmoji(body))
          : scaleSystemEmoji(body)}
      </Linkify>
    );
  }

  if (renderMode === 'markdown') {
    return <>{parse(marked.parse(body, { breaks: true }) as string, htmlReactParserOptions)}</>;
  }

  if (customBody) {
    if (customBody === '') return <MessageEmptyContent />;
    return <>{parse(sanitizeCustomHtml(customBody), htmlReactParserOptions)}</>;
  }

  if (hasMarkdownFeatures(body)) {
    return <>{parse(marked.parse(body, { breaks: true }) as string, htmlReactParserOptions)}</>;
  }

  return (
    <Linkify options={linkifyOpts}>
      {highlightRegex
        ? highlightText(highlightRegex, scaleSystemEmoji(body))
        : scaleSystemEmoji(body)}
    </Linkify>
  );
}
