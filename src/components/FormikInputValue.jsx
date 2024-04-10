import React, { useState } from 'react';
import styled from 'styled-components';
import { useField } from 'formik';
import { theme } from '@/data/themes';

const Input = styled.input`
	padding: 10px;
	padding-right: 25px;
	background: ${(props) =>
		props.design === 1 || !props.design
			? 'transparent'
			: theme.dark.background.primary};
	border: 1px solid
		${(props) =>
			props.design === 1 || !props.design
				? theme.dark.borders.secundary
				: theme.dark.borders.primary};
	border-radius: 10px;
	color: ${theme.dark.fonts.subHeaders_text};
	width: 100%;
`;

const InputContainer = styled.div`
	width: ${(props) => (props.flexDir ? 'auto' : '100%')};
	position: relative;

	&::before {
		content: '${(props) => props.simbol}';
		color: ${theme.dark.fonts.subHeaders_text};
		position: absolute;
		right: 10px;
		top: 10px;
	}
`;

const Select = styled.select`
	padding: 10px;
	background: transparent;
	border: 1px solid ${theme.dark.borders.secundary};
	border-radius: 10px;
	color: ${theme.dark.fonts.subHeaders_text};
	width: 100%;
`;

const Label = styled.label`
	font-size: 0.85em;
	margin-left: 0;
	color: ${(props) =>
		props.isFocused
			? theme.dark.fonts.title_headers
			: theme.dark.fonts.subHeaders_text};
	transition: 0.25s ease-in-out;
`;

const FieldStyled = styled.div`
	display: flex;
	flex-wrap: nowrap;
	flex-direction: ${(props) => (props.flexDir ? 'row-reverse' : 'column')};
	justify-content: ${(props) => (props.flexDir ? 'flex-end' : 'center')};
	align-items: ${(props) => (props.flexDir ? 'center' : 'start')};
	width: ${(props) => props.size};

	gap: 2.5px;
`;

const FormikInputValue = ({ title, size, ...props }) => {
	const [field, meta, helpers] = useField(props);
	const [isFocused, setIsFocused] = useState(false);

	const fieldSize = {
		1: '100%',
		2: '49%',
		3: '32.6%',
	};

	const handleFocus = () => {
		setIsFocused(true);
	};

	const handleBlur = () => {
		setIsFocused(false);
	};

	return (
		<FieldStyled
			size={fieldSize[size]}
			flexDir={props.type === 'checkbox' ? true : false}
		>
			<Label htmlFor={props.name} isFocused={isFocused}>
				{title}
			</Label>
			{props.type !== 'select' ? (
				<InputContainer
					simbol={props.simbol}
					flexDir={props.type === 'checkbox' ? true : false}
				>
					<Input
						id={props.name}
						onFocus={handleFocus}
						onBlur={handleBlur}
						error={meta.error}
						step={props.type === 'number' ? 'any' : undefined}
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
					{...field}
					{...props}
				>
					<option value='' selected disabled hidden>
						Escoge una opcion
					</option>
					{props.children}
				</Select>
			)}

			{meta.error && (
				<p style={{ color: theme.dark.colors.red }}>{meta.error}</p>
			)}
		</FieldStyled>
	);
};

export default FormikInputValue;
