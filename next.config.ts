import type { NextConfig } from "next";



const nextConfig: NextConfig = {
	devIndicators: {
		appIsrStatus: true,
		buildActivityPosition: "top-right",
	},
	images: {
		remotePatterns: [
			// {
			// 	protocol: "https",
			// 	hostname: "",
			// 	pathname: "/**",
			// },
		]
	}
};

export default nextConfig;