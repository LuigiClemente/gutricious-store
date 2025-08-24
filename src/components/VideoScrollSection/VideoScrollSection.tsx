'use client';

import { useRef, useEffect, useState } from 'react';

import styles from './VideoScrollSection.module.css';

interface VideoScrollSectionProps {
  videoSrc: string;
  title?: string;
  subtitle?: string;
  videoType?: string;
  height?: string;
  scrollFactor?: number;
}

export function VideoScrollSection({ 
  videoSrc, 
  title = "Nutritional Excellence",
  subtitle = "Discover the quality in every bite",
  videoType = 'video/webm; codecs="vp9, opus"',
  height = '300vh',
  scrollFactor = 1
}: VideoScrollSectionProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [videoDuration, setVideoDuration] = useState(0);
  const [isInView, setIsInView] = useState(false);

  // Handle video load and get duration
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleMetadata = () => {
      setVideoDuration(video.duration);
      // Ensure video is paused and ready at first frame
      video.pause();
      video.currentTime = 0;
    };

    video.addEventListener('loadedmetadata', handleMetadata);
    return () => video.removeEventListener('loadedmetadata', handleMetadata);
  }, []);

  // Set up intersection observer to detect when video is in viewport
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => setIsInView(entries[0].isIntersecting),
      { threshold: 0.1 }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Handle scroll events and update video time
  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    
    if (!video || !container || !videoDuration) return;

    let animationFrameId: number;
    let ticking = false;

    const updateVideoTime = () => {
      if (!isInView) return;
      
      const containerRect = container.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const scrollY = window.scrollY;

      // Calculate how much of the container is visible
      const containerTop = Math.max(containerRect.top, 0);
      const containerBottom = Math.min(containerRect.bottom, windowHeight);
      const visibleHeight = containerBottom - containerTop;
      
      if (visibleHeight <= 0) return;
      
      // Calculate the scroll progress (0 to 1) within the container
      const scrollProgress = Math.max(0, Math.min(1, 
        (scrollY - container.offsetTop + windowHeight) / 
        (container.offsetHeight + windowHeight)
      ));
      
      // Apply scroll factor and update video time
      const adjustedProgress = Math.max(0, Math.min(1, scrollProgress * scrollFactor));
      video.currentTime = adjustedProgress * videoDuration;
      
      // Log debug info
      console.log({
        scrollY,
        containerTop: container.offsetTop,
        containerHeight: container.offsetHeight,
        scrollProgress,
        adjustedProgress,
        currentTime: video.currentTime,
        duration: videoDuration
      });
      
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        animationFrameId = requestAnimationFrame(updateVideoTime);
        ticking = true;
      }
    };

    // Add event listeners
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', updateVideoTime, { passive: true });
    
    // Initial update
    updateVideoTime();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updateVideoTime);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isInView, videoDuration, scrollFactor]);

  // Only render video on client-side to prevent hydration issues
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <section className={styles.section}>
      <div
        ref={containerRef}
        style={{
          height,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Only render video on client-side */}
        {isClient && (
          <video
            ref={videoRef}
            style={{
              width: '100%',
              height: '100vh',
              objectFit: 'cover' as const,
              position: 'sticky',
              top: 0
            }}
            muted
            playsInline
            preload="auto"
          >
            <source src={videoSrc} type={videoType} />
            Your browser does not support the video tag.
          </video>
        )}
        <div className={styles.content}>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>
      </div>
    </section>
  );
}
