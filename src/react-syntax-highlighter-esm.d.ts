declare module 'react-syntax-highlighter/dist/esm/prism-light' {
  import type { ComponentType } from 'react'

  const SyntaxHighlighter: ComponentType<Record<string, unknown>> & {
    registerLanguage: (name: string, language: unknown) => void
  }

  export default SyntaxHighlighter
}

declare module 'react-syntax-highlighter/dist/esm/languages/prism/*' {
  const language: unknown
  export default language
}

declare module 'react-syntax-highlighter/dist/esm/styles/prism' {
  export const oneLight: unknown
  export const vscDarkPlus: unknown
}
