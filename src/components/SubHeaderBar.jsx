import Image from 'next/image'
import styled from 'styled-components'
import { theme } from '../data/themes'

const color_selection = (props) => {
	const color = props.color
		? theme.dark.colors[props.color]
		: 'rgba(255, 255, 255, 0.45)'

	const extension = props.color ? '5px' : '10px'

	return `0px 0px 10px ${extension} ${color};`
}

const IconStyled = styled.div`
	background: ${theme.dark.background.secundary};
	border-radius: 10px;
	width: min-content;
	padding: 5px;
	align-items: center;
	display: flex;
	transition: 0.5s;

	&:hover {
		filter: ${(props) => !props.color && 'invert(100%)'};
		background: ${(props) => props.color && theme.dark.colors[props.color]};
		box-shadow:${color_selection} 

		-webkit-box-shadow:${color_selection} 
		-moz-box-shadow:${color_selection} 
	}
`

const H_Title = styled.h3`
	font-weight: normal;
	color: ${theme.dark.fonts.title_headers};
`

const SubHeaderBar = ({ children, tag = 'h3', ...props }) => {
	H_Title.target = tag

	return (
		<div
			style={{
				display: 'flex',
				justifyContent: 'space-between',
				alignItems: 'center',
			}}
		>
			<H_Title>{children}</H_Title>
			{props.icon && (
				<IconStyled onClick={props.onClick}>
					<Image
						src={props.icon}
						alt='home_ico'
						width={props.size}
						height={props.size}
						style={{
							filter: 'invert(100%)',
							...props.style,
						}}
					/>
				</IconStyled>
			)}
		</div>
	)
}

export const IconComponent = ({ size, url, onClick, style, ...props }) => (
	<IconStyled onClick={onClick} {...props}>
		<Image
			src={url}
			alt='ico'
			width={size}
			height={size}
			style={{
				filter: 'invert(100%)',
				...style,
			}}
		/>
	</IconStyled>
)

export default SubHeaderBar
