/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	output: undefined,
	env: {
		API_HOST: process.env.API_HOST,
		API_URL: process.env.API_URL,
	},
	experimental: {
		forceSwcTransforms: true,
	},
	compiler: {
		styledComponents: true,
	},
}

export default nextConfig
