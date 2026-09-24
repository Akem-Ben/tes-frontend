import { createGlobalStyle } from "styled-components";

/** Base reset + document level styling. */
export const GlobalStyle = createGlobalStyle`
  *, *::before, *::after { box-sizing: border-box; }

  * { margin: 0; }

  html {
    scroll-behavior: smooth;
    -webkit-text-size-adjust: 100%;
    font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto,
      "Helvetica Neue", Arial, "Noto Sans", sans-serif;
    line-height: 1.5;
  }

  body {
    min-height: 100vh;
    background-color: ${({ theme }) => theme.color.bg};
    color: ${({ theme }) => theme.color.text};
    -webkit-font-smoothing: antialiased;
    transition: background-color 0.2s ease, color 0.2s ease;
  }

  img, svg, video { display: block; max-width: 100%; }

  input, button, textarea, select {
    font: inherit;
    color: inherit;
  }

  button { background: none; border: none; cursor: pointer; }
  button:disabled { cursor: not-allowed; }

  h1, h2, h3, h4, h5, h6 { font-size: inherit; font-weight: inherit; }

  ul, ol { list-style: none; padding: 0; }

  a { color: inherit; text-decoration: none; }

  table { border-collapse: collapse; }

  @keyframes tes-fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;
