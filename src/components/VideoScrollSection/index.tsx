'use client';

import dynamic from 'next/dynamic';

export const VideoScrollSection = dynamic(
  () => import('./VideoScrollSection').then(mod => ({ default: mod.VideoScrollSection })),
  { 
    ssr: false,
    loading: () => (
      <div style={{ height: '100vh', width: '100%', backgroundColor: '#000' }} />
    )
  }
);
