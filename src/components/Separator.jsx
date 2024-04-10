import styled from 'styled-components';
import { theme } from '../data/themes';

const Separator = styled.div`
	width: ${(props) => props.width + '%' || '90%'};
	border: 1px solid ${(props) => props.color || theme.dark.borders.primary};
	margin: 10px auto;
`;

export default Separator;
