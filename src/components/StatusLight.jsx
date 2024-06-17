import styled from 'styled-components';
import { theme } from '../data/themes';

const statusColors = {
	active: theme.dark.colors.green,
	archive: theme.dark.colors.yellow,
	off: theme.dark.colors.red,
	disable: theme.dark.colors.purple,
	blocked: theme.dark.colors.red,
};

const CompStyle = styled.div`
	border: none;
	border-radius: 100%;
	width: ${(props) => (props.size ? props.size + 'px' : '10px')};
	height: ${(props) => (props.size ? props.size + 'px' : '10px')};
	background: ${(props) => props.color || theme.dark.colors.transparent};
	box-shadow: 0px 0px 10px 1px
		${(props) => props.color || theme.dark.colors.transparent};
	-webkit-box-shadow: 0px 0px 10px 1px
		${(props) => props.color || theme.dark.colors.transparent};
	-moz-box-shadow: 0px 0px 10px 1px
		${(props) => props.color || theme.dark.colors.transparent};
`;

const StatusLight = (props) => (
	<CompStyle color={statusColors[props.status]} {...props} />
);

export default StatusLight;
