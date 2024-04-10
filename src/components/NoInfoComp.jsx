import { theme } from '@/data/themes';

const NoInfoComp = ({ content }) => (
	<div
		style={{
			display: 'flex',
			flex: 1,
			flexDirection: 'column',
		}}
	>
		<h3
			style={{
				margin: 'auto',
				display: 'block',
				color: theme.dark.fonts.subHeaders_text,
				fontWeight: 100,
				fontStyle: 'normal',
			}}
		>
			{content}
		</h3>
	</div>
);

export default NoInfoComp;
