import Image from 'next/image'
import logo from '/public/logos/logo_betjockey.png'

const LogoTitle = () => (
	<Image
		src={logo}
		alt={'ico'}
		style={{
			width: '100%',
			objectFit: 'contain',
			margin: 0,
			padding: 0,
			maxHeight: '90px',
		}}
	/>
)

export default LogoTitle
