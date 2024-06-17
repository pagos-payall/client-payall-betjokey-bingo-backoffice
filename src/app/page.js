'use client';
import { useRouter } from 'next/navigation';

export default function Home() {
	const router = useRouter();
	router.push('/login');

	return (
		<main
			style={{
				background: `linear-gradient(180deg, rgba(0,0,0,1) 0%, rgba(38,38,38,1) 100%)`,
				padding: '0px',
				margin: '0',
				height: '100%',
				display: 'flex',
			}}
		></main>
	);
}
