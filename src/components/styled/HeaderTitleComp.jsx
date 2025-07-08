import logo_compact from '/public/logos/logo_betjockey_compacto.png'
import Image from 'next/image'

const HeaderTitleComp = () => (
	<div
		style={{
			flex: 0.5,
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'flex-start',
		}}
	>
		<Image src={logo_compact} alt={'ico'} width={45} height={45} priority />
	</div>
)

export default HeaderTitleComp
