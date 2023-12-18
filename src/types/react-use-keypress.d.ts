declare module 'react-use-keypress' {
  export default function useKeyPress(
    key: KeyboardEvent['key'] | KeyboardEvent['key'][],
    callback?: (e: KeyboardEvent) => void
  ): void;
}