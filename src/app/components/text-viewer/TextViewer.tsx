/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import React, { ComponentProps, HTMLAttributes, Suspense, forwardRef, lazy, useState } from 'react';
import classNames from 'classnames';
import parse, { domToReact, Element, HTMLReactParserOptions } from 'html-react-parser';
import { marked } from 'marked';
import { Box, Chip, Header, Icon, IconButton, Icons, Scroll, Text, as } from 'folds';
import { ErrorBoundary } from 'react-error-boundary';
import * as css from './TextViewer.css';
import { copyToClipboard } from '../../utils/dom';

// Import GitHub Markdown CSS theme
import 'github-markdown-css/github-markdown-light.css';

const ReactPrism = lazy(() => import('../../plugins/react-prism/ReactPrism'));

const isMarkdownLang = (langName: string): boolean => 
  // langName is derived from mimeType via mimeTypeToExt()
  langName === 'markdown' || langName === 'md';


/**
 * Simple HTML parser options for markdown rendering.
 * Only adds target="_blank" to links for security.
 * Other elements use default rendering, styled by github-markdown-css.
 */
const createMarkdownParserOptions = (): HTMLReactParserOptions => ({
  replace: (domNode) => {
    if (domNode instanceof Element && domNode.name === 'a') {
      const { attribs, children } = domNode;
      return (
        <a {...attribs} target="_blank" rel="noreferrer noopener">
          {domToReact(children, createMarkdownParserOptions())}
        </a>
      );
    }
    return undefined;
  },
});

type TextViewerContentProps = {
  text: string;
  langName: string;
  size?: ComponentProps<typeof Text>['size'];
} & HTMLAttributes<HTMLPreElement>;
export const TextViewerContent = forwardRef<HTMLPreElement, TextViewerContentProps>(
  ({ text, langName, size, className, ...props }, ref) => (
    <Text
      as="pre"
      size={size}
      className={classNames(css.TextViewerPre, `language-${langName}`, className)}
      {...props}
      ref={ref}
    >
      <ErrorBoundary fallback={<code>{text}</code>}>
        <Suspense fallback={<code>{text}</code>}>
          <ReactPrism key={text}>{(codeRef) => <code ref={codeRef}>{text}</code>}</ReactPrism>
        </Suspense>
      </ErrorBoundary>
    </Text>
  )
);

export type TextViewerProps = {
  name: string;
  text: string;
  langName: string;
  requestClose: () => void;
};

export const TextViewer = as<'div', TextViewerProps>(
  ({ className, name, text, langName, requestClose, ...props }, ref) => {
    const handleCopy = () => {
      copyToClipboard(text);
    };

    const isMarkdown = isMarkdownLang(langName);
    const [showRendered, setShowRendered] = useState(isMarkdown);

    const toggleRender = () => {
      setShowRendered(!showRendered);
    };

    const renderedMarkdown = showRendered
      ? parse(marked.parse(text, { breaks: true }) as string, createMarkdownParserOptions())
      : null;

    return (
      <Box
        className={classNames(css.TextViewer, className)}
        direction="Column"
        {...props}
        ref={ref}
      >
        <Header className={css.TextViewerHeader} size="400">
          <Box grow="Yes" alignItems="Center" gap="200">
            <IconButton size="300" radii="300" onClick={requestClose}>
              <Icon size="50" src={Icons.ArrowLeft} />
            </IconButton>
            <Text size="T300" truncate>
              {name}
            </Text>
          </Box>
          <Box shrink="No" alignItems="Center" gap="200">
            {isMarkdown && (
              <Chip variant="Primary" radii="300" onClick={toggleRender}>
                <Icon size="50" src={showRendered ? Icons.Code : Icons.Eye} />
                <Text size="B300">{showRendered ? 'Raw' : 'Render'}</Text>
              </Chip>
            )}
            <Chip variant="Primary" radii="300" onClick={handleCopy}>
              <Text size="B300">Copy All</Text>
            </Chip>
          </Box>
        </Header>

        <Box
          grow="Yes"
          className={css.TextViewerContent}
          justifyContent="Center"
          alignItems="Center"
        >
          <Scroll hideTrack variant="Background" visibility="Hover">
            {showRendered && isMarkdown ? (
              <article className="markdown-body">
                {renderedMarkdown}
              </article>
            ) : (
              <TextViewerContent
                className={css.TextViewerPrePadding}
                text={text}
                langName={langName}
              />
            )}
          </Scroll>
        </Box>
      </Box>
    );
  }
);
