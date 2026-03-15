import React from 'react';
import parse, { HTMLReactParserOptions } from 'html-react-parser';
import Linkify from 'linkify-react';
import { Opts } from 'linkifyjs';
import { marked } from 'marked';
import { MessageEmptyContent } from './content';
import { sanitizeCustomHtml } from '../../utils/sanitize';
import { highlightText, scaleSystemEmoji } from '../../plugins/react-custom-html-parser';
import * as css from '../../styles/CustomHtml.css';

type RenderBodyProps = {
  body: string;
  customBody?: string;

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
  highlightRegex,
  htmlReactParserOptions,
  linkifyOpts,
}: RenderBodyProps) {
  if (body === '') <MessageEmptyContent />;
  if (customBody) {
    if (customBody === '') <MessageEmptyContent />;
    return parse(sanitizeCustomHtml(customBody), htmlReactParserOptions);
  }

  if (hasMarkdownFeatures(body)) {
    const rendered = parse(marked.parse(body) as string, htmlReactParserOptions);
    if (highlightRegex && typeof rendered === 'object') {
      return rendered;
    }
    return rendered;
  }

  return (
    <Linkify options={linkifyOpts}>
      {highlightRegex
        ? highlightText(highlightRegex, scaleSystemEmoji(body))
        : scaleSystemEmoji(body)}
    </Linkify>
  );
}
