import { css } from '@emotion/react';

export const globalStyles = css`
  @font-face {
    font-family: 'Century Gothic';
    src: local('Century Gothic');
  }

  @font-face {
    font-family: 'Trebuchet MS';
    src: local('Trebuchet MS');
  }

  @font-face {
    font-family: 'Candara';
    src: local('Candara');
  }

  body {
    margin: 0;
    padding: 0;
    font-family: 'Trebuchet MS', sans-serif;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: 'Century Gothic', sans-serif;
  }

  p, span, div {
    font-family: 'Candara', sans-serif;
  }
`;
