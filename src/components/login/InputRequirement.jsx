import Image from 'next/image';
import { theme } from '@/data/themes';
import { closeIcon, doneIcon } from '@/data/icons';

const InputRequirement = ({ text = 'testo', boolean = true }) => (
	<div>
		<div
			style={{
				display: 'flex',
				gap: '5px',
				justifyContent: 'flex-start',
				width: '100%',
				color: theme.dark.fonts.subHeaders_text,
			}}
		>
			<Image
				src={boolean ? doneIcon : closeIcon}
				alt={'ico'}
				width={12.5}
				height={12.5}
				style={{
					filter: boolean ? theme.dark.filters.green : theme.dark.filters.red,
				}}
			/>
			<p>{text}</p>
		</div>
	</div>
);

export default InputRequirement;
