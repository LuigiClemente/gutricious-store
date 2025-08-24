'use client';

import dynamic from 'next/dynamic';

const ScrollVideoPlayerComponent = dynamic(
  () => import('./ScrollVideoPlayer').then(mod => ({ default: mod.ScrollVideoPlayer })),
  { 
    ssr: false,
    loading: () => (
      <div style={{ height: '100vh', width: '100%', backgroundColor: '#000' }} />
    )
  }
);

export function ClientScrollVideoPlayer() {
  return <ScrollVideoPlayerComponent videoSrc="/videos/transparent-video.webm" containerHeight="300vh" />;
}
