import styled from 'styled-components'
import { theme } from '@/data/themes'

export const FormDiv = styled.form`
	display: flex;
	flex-direction: column;
	justify-content: center;
	padding: 20px;
	gap: 15px;
`

export const FieldsContainer = styled.div`
	display: flex;
	justify-content: space-between;
	flex-wrap: wrap;
	column-gap: 1%;
	row-gap: 25px;
`

export const FieldsPorcenContainer = styled.div`
	border: 1px solid ${theme.dark.borders.secundary};
	border-radius: 10px;
	padding: 25px 10px;
	position: relative;
	width: 100%;

	display: flex;
	justify-content: space-between;
	flex-wrap: no-wrap;
	column-gap: 1%;
`

export const PorcenSubHeader = styled.h6`
	color: ${theme.dark.fonts.subHeaders_text};
	font-size: ${(props) => (props.$position === 'bottom' ? '0.7em' : '0.85em')};
	font-weight: bold;
	display: inline-block;
	background: ${theme.dark.background.secundary};
	padding: 5px;
	position: absolute;
	width: max-content;

	top: ${(props) => (props.$position === 'top' ? '-14%' : 'auto')};
	left: ${(props) => (props.$position === 'top' ? '2.5%' : 'auto')};
	bottom: ${(props) => (props.$position === 'bottom' ? '-12%' : 'auto')};
	right: ${(props) => (props.$position === 'bottom' ? '2.5%' : 'auto')};
`
