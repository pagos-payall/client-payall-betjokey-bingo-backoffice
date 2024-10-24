import styled from 'styled-components'
import { theme } from '@/data/themes'

export const ModalContainer = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	position: absolute;
	top: 0;
	left: 0;
	height: 100vh;
	width: 100%;
	background: rgba(0, 0, 0, 0.5);
	z-index: 100;
`

export const ModalBox = styled.div`
	margin: auto;
	background: rgb(30, 30, 30);
	width: 400px;
	border-radius: 10px;
	background-size: 100% 300%;
	display: flex;
	flex-direction: column;
	flex-wrap: nowrap;
	gap: 5px;
	padding: 25px 10px;
	align-items: center;
	justify-content: space-evenly;
	position: relative;
	color: white;
	text-align: center;
	height: ${(props) => props.h ?? '30vh'};
	max-height: ${(props) => props.$maxHeight || 'auto'};
`

export const Taxes = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: flex-start;
	align-items: start;
	gap: 1.5px;
	padding-left: 10px;
`

export const Document = styled.div`
	padding: 10px;
	margin: 0px;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 10px;
	flex-grow: 1;
`

export const Header = styled.div`
	display: flex;
	gap: 5px;
	padding: 5px;
	justify-content: space-around;
	flex-wrap: wrap;
`

export const SubTitle = styled.p`
	flex-grow: 1;
	text-align: left;
	font-size: 0.75em;
`

export const Operation = styled.div`
	border: 1px solid ${theme.dark.borders.secundary};
	border-radius: 10px;
	width: 100%;
	padding: 10px;
	align-items: center;
	align-content: center;
	display: flex;
	flex-direction: column;
	justify-content: flex-start;
	align-items: start;
	gap: 5px;
	text-align: left;
`

export const SubItems = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: flex-start;
	align-items: start;
	gap: 1.5px;
	padding-left: 10px;
`
