import styled from 'styled-components';
import { theme } from '../data/themes';

const statusColors = {
	published: theme.dark.colors.green,
	waiting: theme.dark.colors.yellow,
	off: theme.dark.colors.red,
};

const CompStyle = styled.div`
	border: none;
	border-radius: 100%;
	width: ${(props) => (props.size ? props.size + 'px' : '10px')};
	height: ${(props) => (props.size ? props.size + 'px' : '10px')};
	background: ${(props) => props.color || theme.dark.colors.yellow};
	box-shadow: 0px 0px 10px 1px
		${(props) => props.color || theme.dark.colors.yellow};
	-webkit-box-shadow: 0px 0px 10px 1px
		${(props) => props.color || theme.dark.colors.yellow};
	-moz-box-shadow: 0px 0px 10px 1px
		${(props) => props.color || theme.dark.colors.yellow};
`;

const StatusLight = (props) => (
	<CompStyle color={statusColors[props.status]} {...props} />
);

export default StatusLight;
