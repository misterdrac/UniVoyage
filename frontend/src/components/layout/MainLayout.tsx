import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

/**
 * Layout component for main app (with Header/Footer)
 * Wraps main application pages with consistent header and footer
 */
export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}

