import styled from 'styled-components';
import Image from 'next/image';
import { theme } from '../data/themes';
import { searchIcon } from '../data/icons';
import { useField } from 'formik';

const SearchBarStyled = styled.input`
	border-radius: 50px;
	padding: 10px 10px 10px 35px;
	background: ${theme.dark.background.secundary};
	color: white;
	width: 100%;
	border: none;
`;

const SearchBar = ({ ...props }) => {
	return (
		<div
			style={{
				position: 'relative',
			}}
		>
			<Image
				src={searchIcon}
				alt={'ico-search'}
				width={20}
				height={20}
				style={{
					filter: 'invert(100%)',
					position: 'absolute',
					top: '8px',
					left: '10px',
				}}
			/>
			<SearchBarStyled placeholder='Busqueda' {...props} />
		</div>
	);
};

export const InputSearchBar = ({ ...props }) => {
	const [field] = useField(props);
	return (
		<div
			style={{
				position: 'relative',
			}}
		>
			<Image
				src={searchIcon}
				alt={'ico-search'}
				width={20}
				height={20}
				style={{
					filter: 'invert(100%)',
					position: 'absolute',
					top: '8px',
					left: '10px',
				}}
			/>
			<SearchBarStyled placeholder='Busqueda' {...field} {...props} />
		</div>
	);
};

export default SearchBar;
