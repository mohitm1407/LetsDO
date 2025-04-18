declare module 'react-markdown' {
  import React from 'react';
  
  interface ReactMarkdownProps {
    children: string;
    remarkPlugins?: any[];
    components?: any;
    className?: string;
  }
  
  const ReactMarkdown: React.FC<ReactMarkdownProps>;
  export default ReactMarkdown;
}

declare module 'remark-gfm' {
  const remarkGfm: any;
  export default remarkGfm;
}

declare module 'react-syntax-highlighter' {
  import React from 'react';
  
  export interface SyntaxHighlighterProps {
    language?: string;
    style?: any;
    children: string | string[];
    className?: string;
    PreTag?: React.ElementType;
    [key: string]: any;
  }
  
  export const Prism: React.FC<SyntaxHighlighterProps>;
  export const Light: React.FC<SyntaxHighlighterProps>;
}

declare module 'react-syntax-highlighter/dist/esm/styles/prism' {
  export const atomDark: any;
  export const prism: any;
  export const darcula: any;
  export const okaidia: any;
  export const tomorrow: any;
  export const solarizedlight: any;
}

declare module 'react-syntax-highlighter/dist/esm/styles/hljs' {
  export const docco: any;
  export const github: any;
  export const monokai: any;
  export const vs: any;
  export const vs2015: any;
  export const xcode: any;
} 