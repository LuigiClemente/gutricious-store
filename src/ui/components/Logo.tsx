"use client";

import { usePathname } from "next/navigation";
import { LinkWithChannel } from "../atoms/LinkWithChannel";

export const Logo = () => {
	const pathname = usePathname();
	
	const logoContent = (
		<span className="font-bold text-xl text-black">
			Gutricious
		</span>
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
