import { Inter } from "next/font/google";
import "./globals.css";
import { Suspense, type ReactNode } from "react";
import { type Metadata } from "next";
import { DraftModeNotification } from "@/ui/components/DraftModeNotification";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gutricious",
  description: "Gutricious - Your gut health companion",
  applicationName: 'Gutricious',
  authors: [{ name: 'Gutricious Team' }],
  publisher: 'Gutricious',
  creator: 'Gutricious',
  formatDetection: {
    email: true,
    address: true,
    telephone: true,
  },
  icons: {
    icon: 'https://res.cloudinary.com/dizm8txou/image/upload/v1715953409/about-us/static/favicons/falvicon.ico',
    apple: 'https://res.cloudinary.com/dizm8txou/image/upload/v1715953409/about-us/static/favicons/apple-touch-icon.png',
  },
  metadataBase: process.env.NEXT_PUBLIC_STOREFRONT_URL
    ? new URL(process.env.NEXT_PUBLIC_STOREFRONT_URL)
    : undefined,
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
  colorScheme: 'light' as const,
  themeColor: '#2ae8d3',
  category: 'health',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    siteName: 'Gutricious',
    title: 'Gutricious - Your gut health companion',
    description: 'Discover the power of gut health with Gutricious',
    images: [
      {
        url: 'https://res.cloudinary.com/dizm8txou/image/upload/v1715953409/about-us/static/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Gutricious - Your gut health companion',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gutricious - Your gut health companion',
    description: 'Discover the power of gut health with Gutricious',
    images: ['https://res.cloudinary.com/dizm8txou/image/upload/v1715953409/about-us/static/og-image.jpg'],
  },
};

export default function RootLayout(props: { children: ReactNode }) {
	const { children } = props;

	return (
		<html lang="en" className="min-h-dvh">
			<head>
				<link rel="icon" href="https://res.cloudinary.com/dizm8txou/image/upload/v1715953409/about-us/static/favicons/falvicon.ico" />
				<link rel="apple-touch-icon" href="https://res.cloudinary.com/dizm8txou/image/upload/v1715953409/about-us/static/favicons/apple-touch-icon.png" />
			</head>
			<body className={`${inter.className} min-h-dvh`}>
				{children}
				<Suspense>
					<DraftModeNotification />
				</Suspense>
			</body>
		</html>
	);
}
