'use client';

export default function SkipNav() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-accent-500 focus:text-white focus:rounded-lg focus:shadow-elevation-3 focus:text-body-sm focus:font-medium focus:outline-none"
    >
      Skip to main content
    </a>
  );
}
