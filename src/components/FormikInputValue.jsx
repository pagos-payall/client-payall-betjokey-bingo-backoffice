import { useState, forwardRef, useCallback } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { useField } from 'formik'
import { theme } from '@/data/themes'

const Input = styled.input`
	padding: 10px;
	padding-right: 25px;
	background: ${(props) =>
		props.$design === 1 || !props.$design
			? 'transparent'
			: theme.dark.background.primary};
	border: 1px solid
		${(props) =>
			props.$design === 1 || !props.$design
				? theme.dark.borders.secundary
				: theme.dark.borders.primary};
	border-radius: 10px;
	color: ${theme.dark.fonts.subHeaders_text};
	width: 100%;
`

const InputContainer = styled.div`
	width: ${(props) => props.$w};
	position: relative;

	&::before {
		content: '${(props) => props.$simbol}';
		color: ${theme.dark.fonts.subHeaders_text};
		position: absolute;
		right: 10px;
		top: 10px;
	}
`

const Select = styled.select`
	padding: 10px;
	background: transparent;
	border: 1px solid ${theme.dark.borders.secundary};
	border-radius: 10px;
	color: ${theme.dark.fonts.subHeaders_text};
	width: 100%;
`

const Label = styled.label`
	font-size: 0.85em;
	margin-left: 0;
	color: ${(props) =>
		props.$isfocused === 'true'
			? theme.dark.fonts.title_headers
			: theme.dark.fonts.subHeaders_text};
	transition: 0.25s ease-in-out;
	text-align: left;
`

const FieldStyled = styled.div`
	display: flex;
	flex-wrap: nowrap;
	flex-direction: ${(props) =>
		props.$flexdirection === 'true' ? 'row-reverse' : 'column'};
	justify-content: ${(props) =>
		props.$flexdirection === 'true' ? 'flex-end' : 'center'};
	align-items: ${(props) =>
		props.$flexdirection === 'true' ? 'center' : 'start'};
	width: ${(props) => props.$size};

	gap: 2.5px;
`

const FormikInputValue = forwardRef(
	({ children, size, simbol, design, ...props }, ref) => {
		const [field, meta, helpers] = useField(props)
		const [isFocused, setIsFocused] = useState(false)
		const fieldSize = {
			1: '100%',
			2: '49%',
			3: '32.6%',
			6: '15%',
		}

		const handleFocus = useCallback(() => {
			setIsFocused(true)
		}, [])

		const handleBlur = useCallback(() => {
			setIsFocused(false)
		}, [])
		return (
			<FieldStyled
				$size={fieldSize[size]}
				$flexdirection={props.type === 'checkbox' ? 'true' : 'false'}
			>
				<Label htmlFor={props.name} $isfocused={isFocused.toString()}>
					{props.title}
				</Label>
				{props.type !== 'select' ? (
					<InputContainer
						$simbol={simbol}
						$w={props.type === 'checkbox' ? 'auto' : '100%'}
					>
						<Input
							id={props.name}
							onFocus={handleFocus}
							onBlur={handleBlur}
							error={meta.error}
							step={props.type === 'number' ? 'any' : undefined}
							ref={ref}
							$design={design}
							{...field}
							{...props}
						/>
					</InputContainer>
				) : (
					<Select
						id={props.name}
						onFocus={handleFocus}
						onBlur={handleBlur}
						error={meta.error}
						defaultValue={field.value}
						{...field}
						{...props}
					>
						{!field.value && <option>Escoge una opcion</option>}
						{children}
					</Select>
				)}

				{meta.error && (
					<p style={{ color: theme.dark.colors.red }}>{meta.error}</p>
				)}
			</FieldStyled>
		)
	}
)

export const InputStyled = forwardRef(
	({ children, size, simbol, design, ...props }, ref) => {
		const [isFocused, setIsFocused] = useState(false)
		const fieldSize = {
			1: '100%',
			2: '49%',
			3: '32.6%',
			6: '15%',
		}

		const handleFocus = useCallback(() => {
			setIsFocused(true)
		}, [])

		const handleBlur = useCallback(() => {
			setIsFocused(false)
		}, [])

		return (
			<FieldStyled
				$size={fieldSize[size]}
				$flexdirection={props.type === 'checkbox' ? 'true' : 'false'}
			>
				<Label htmlFor={props.name} $isfocused={isFocused.toString()}>
					{props.title}
				</Label>
				<InputContainer
					$simbol={simbol}
					$w={props.type === 'checkbox' ? 'auto' : '100%'}
				>
					<Input
						id={props.name}
						onFocus={handleFocus}
						onBlur={handleBlur}
						step={props.type === 'number' ? 'any' : undefined}
						ref={ref}
						$design={design}
						{...props}
					/>
				</InputContainer>
			</FieldStyled>
		)
	}
)

FormikInputValue.propTypes = {
	children: PropTypes.node,
	size: PropTypes.number.isRequired,
	simbol: PropTypes.string,
	title: PropTypes.string,
	type: PropTypes.string.isRequired,
	name: PropTypes.string.isRequired,
}

export default FormikInputValue
