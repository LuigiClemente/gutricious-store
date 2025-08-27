"use client";
import { useEffect, useRef, useState } from "react";

interface ScrollVideoPlayerProps {
	videoSrc: string;
	containerHeight?: string;
}

export const ScrollVideoPlayer = ({ videoSrc, containerHeight = "300vh" }: ScrollVideoPlayerProps) => {
	const videoRef = useRef<HTMLVideoElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const scrollTriggerRef = useRef<any>(null);
	const [isVideoLoaded, setIsVideoLoaded] = useState(false);
	const [videoReady, setVideoReady] = useState(false);

	// Utility function to add one-time event listener
	const once = (el: HTMLElement | Document, event: string, fn: EventListener, opts?: AddEventListenerOptions) => {
		const onceFn = function (e: Event) {
			el.removeEventListener(event, onceFn);
			fn.call(this, e);
		};
		el.addEventListener(event, onceFn, opts);
		return onceFn;
	};

	useEffect(() => {
		const video = videoRef.current;
		const container = containerRef.current;

		if (!video || !container) return;

		// Load GSAP and ScrollTrigger from CDN
		const loadGSAP = async () => {
			if (typeof window.gsap === "undefined") {
				return new Promise((resolve) => {
					const script1 = document.createElement("script");
					script1.src = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js";
					document.head.appendChild(script1);

					script1.onload = () => {
						const script2 = document.createElement("script");
						script2.src = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js";
						document.head.appendChild(script2);
						script2.onload = resolve;
					};
				});
			}
		};

		const initializeScrollTrigger = () => {
			if (typeof window.gsap === "undefined" || !videoReady) return;

			// Clean up existing instances
			if (scrollTriggerRef.current) {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
				scrollTriggerRef.current.kill();
			}
			// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
			window.ScrollTrigger.getAll().forEach((trigger: any) => trigger.kill());

			window.gsap.registerPlugin(window.ScrollTrigger);

			// Use GSAP timeline approach for smoother scrubbing
			const tl = window.gsap.timeline({
				scrollTrigger: {
					trigger: container,
					start: "top top",
					end: "bottom bottom",
					scrub: 0.5, // Add slight smoothing
					invalidateOnRefresh: true,
					refreshPriority: -1,
				},
			});

			// Animate the video currentTime directly
			tl.to(video, {
				currentTime: video.duration,
				duration: 1,
				ease: "none",
			});

			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			scrollTriggerRef.current = tl.scrollTrigger;
		};

		// Enhanced video loading and preparation
		const prepareVideo = () => {
			video.preload = "auto";
			video.muted = true;
			video.playsInline = true;
			video.controls = false;
			video.disablePictureInPicture = true;

			// Optimize video for smooth scrubbing
			video.style.pointerEvents = "none";

			const handleLoadedData = () => {
				setVideoReady(true);
				setIsVideoLoaded(true);

				// Initialize scroll trigger immediately
				setTimeout(initializeScrollTrigger, 50);
			};

			const handleCanPlayThrough = () => {
				// Video is fully loaded and can play through without buffering
				if (!videoReady) {
					handleLoadedData();
				}
			};

			if (video.readyState >= 2) {
				// HAVE_CURRENT_DATA
				handleLoadedData();
			} else {
				video.addEventListener("loadeddata", handleLoadedData, { once: true });
				video.addEventListener("canplaythrough", handleCanPlayThrough, {
					once: true,
				});
			}
		};

		// iOS activation fix
		const activateVideoOnIOS = () => {
			const touchHandler = () => {
				video
					.play()
					.then(() => {
						video.pause();
						video.currentTime = 0;
					})
					.catch(() => {
						video.load();
					});
			};

			once(document.documentElement, "touchstart", touchHandler);
			once(document.documentElement, "click", touchHandler);
		};

		// Load video as blob for better performance
		const loadVideoAsBlob = () => {
			if (!window.fetch || !videoSrc) return;

			// Don't blob load immediately, let the initial load happen first
			setTimeout(() => {
				fetch(videoSrc)
					.then((response) => {
						if (!response.ok) throw new Error("Network response was not ok");
						return response.blob();
					})
					.then((blob) => {
						const blobURL = URL.createObjectURL(blob);
						const currentTime = video.currentTime;

						video.src = blobURL;
						video.load();

						video.addEventListener(
							"loadeddata",
							() => {
								if (video) {
									video.currentTime = currentTime;
								}
								// Refresh ScrollTrigger after blob load
								if (window.ScrollTrigger) {
									window.ScrollTrigger.refresh();
								}
							},
							{ once: true },
						);
					})
					.catch((error) => {
						console.warn("Failed to load video as blob:", error);
					});
			}, 1000);
		};

		const init = async () => {
			await loadGSAP();
			activateVideoOnIOS();
			prepareVideo();
			loadVideoAsBlob();
		};

		void init();

		// Cleanup
		return () => {
			if (scrollTriggerRef.current) {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
				scrollTriggerRef.current.kill();
			}
			if (window.ScrollTrigger) {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
				window.ScrollTrigger.getAll().forEach((trigger: any) => trigger.kill());
			}
		};
	}, [videoSrc, videoReady]);

	// Handle window resize
	useEffect(() => {
		const handleResize = () => {
			if (window.ScrollTrigger) {
				window.ScrollTrigger.refresh();
			}
		};

		let timeoutId: NodeJS.Timeout;
		const debouncedResize = () => {
			clearTimeout(timeoutId);
			timeoutId = setTimeout(handleResize, 100);
		};

		window.addEventListener("resize", debouncedResize);
		return () => {
			window.removeEventListener("resize", debouncedResize);
			clearTimeout(timeoutId);
		};
	}, []);

	return (
		<div className="w-full">
			<div ref={containerRef} id="container" className="relative" style={{ height: containerHeight }}>
				<div className="sticky top-0 h-screen w-full overflow-hidden">
					<video
						ref={videoRef}
						className="video-background h-full w-full object-cover"
						src={videoSrc}
						muted
						playsInline
						preload="auto"
						disablePictureInPicture
						style={{
							display: "block",
							width: "100%",
							height: "100%",
							objectFit: "cover" as const,
						}}
					/>

					{/* Loading indicator */}
					{!isVideoLoaded && (
						<div className="absolute inset-0 flex items-center justify-center bg-black">
							<div className="text-center text-white">
								<div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-white"></div>
								<div className="text-lg">Loading video...</div>
							</div>
						</div>
					)}

					{/* Debug info */}
				</div>

				{/* Content overlay */}
			</div>

			{/* Additional content section */}
		</div>
	);
};
