"use client";

import { usePathname } from "next/navigation";
import { LinkWithChannel } from "../atoms/LinkWithChannel";

export const Logo = () => {
	const pathname = usePathname();

	const logoContent = (
		<img
			src="https://imagedelivery.net/SeMaLpTX-RsMHiKUXQXe3Q/15c4ab8d-b9ab-4c00-2ba2-04c8c74e7d00/public"
			alt="Gutricious"
			className="h-10 w-auto"
		/>
	);

	if (pathname === "/") {
		return (
			<h1 className="flex items-center" aria-label="Gutricious homepage">
				{logoContent}
			</h1>
		);
	}
	return (
		<div className="flex items-center">
			<LinkWithChannel aria-label="Gutricious homepage" href="/">
				{logoContent}
			</LinkWithChannel>
		</div>
	);
};
