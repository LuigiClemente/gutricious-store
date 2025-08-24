'use client';

import { useEffect, useRef, useState } from 'react';

interface ScrollVideoProps {
    videoSrc: string;
    height?: string;
    scrollFactor?: number;
    className?: string;
}

export const ScrollVideo: React.FC<ScrollVideoProps> = ({
    videoSrc,
    height = '300vh',
    scrollFactor = 1,
    className = ''
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [videoDuration, setVideoDuration] = useState(0);
    const [isInView, setIsInView] = useState(false);
    const frameIdRef = useRef<number | null>(null);

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

        const updateVideoPlayback = () => {
            if (!isInView) return;

            const rect = container.getBoundingClientRect();
            const containerHeight = container.offsetHeight;
            const windowHeight = window.innerHeight;

            // Calculate how far through the container we've scrolled (0 to 1)
            const scrollProgress = 1 - (rect.bottom - windowHeight) / containerHeight;

            // Apply scroll factor and clamp between 0 and 1
            const adjustedProgress = Math.max(0, Math.min(1, scrollProgress * scrollFactor));

            // Update video time
            video.currentTime = adjustedProgress * videoDuration;
        };

        const handleScroll = () => {
            if (frameIdRef.current === null) {
                frameIdRef.current = requestAnimationFrame(() => {
                    updateVideoPlayback();
                    frameIdRef.current = null;
                });
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        // Initialize on first render
        updateVideoPlayback();

        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (frameIdRef.current !== null) {
                cancelAnimationFrame(frameIdRef.current);
            }
        };
    }, [isInView, videoDuration, scrollFactor]);

    return (
        <div
            ref={containerRef}
            className={className}
            style={{
                height,
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <video
                ref={videoRef}
                src={videoSrc}
                className="w-full h-screen object-cover"
                style={{
                    position: 'sticky',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100vh',
                    objectFit: 'cover'
                }}
                muted
                playsInline
                preload="auto"
            />
        </div>
    );
};

// Named export above
