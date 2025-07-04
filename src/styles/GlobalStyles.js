'use client';

import { createGlobalStyle } from 'styled-components';
import { theme } from '@/data/themes';

const GlobalStyles = createGlobalStyle`
  body {
    background-color: ${theme.dark.background.primary};
    color: ${theme.dark.fonts.light_text};
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  }

  /* Sobrescribir el fondo blanco que está apareciendo */
  #__next {
    background-color: ${theme.dark.background.primary};
    min-height: 100vh;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  /* Asegurar que todos los inputs mantengan el tema oscuro */
  input, select, textarea {
    background-color: ${theme.dark.background.secundary};
    color: ${theme.dark.fonts.light_text};
    border: 1px solid ${theme.dark.borders.input_border};
  }

  /* Estilos para el scrollbar */
  ::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }

  ::-webkit-scrollbar-track {
    background: ${theme.dark.background.secundary};
  }

  ::-webkit-scrollbar-thumb {
    background: ${theme.dark.colors.purple};
    border-radius: 5px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${theme.dark.colors.lightPurple};
  }
`;

export default GlobalStyles;