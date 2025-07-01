'use client';

import StyledComponentsRegistry from '@/lib/registry';
import GlobalStyles from '@/styles/GlobalStyles';

export default function StyledComponentsProvider({ children }) {
  return (
    <StyledComponentsRegistry>
      <GlobalStyles />
      {children}
    </StyledComponentsRegistry>
  );
}