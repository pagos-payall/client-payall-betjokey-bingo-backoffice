import { useState } from 'react';
import FormikInputValue from './FormikInputValue';
import Buttom from './Button';
import Separator from './Separator';
import SubHeaderBar from './SubHeaderBar';
import { expandIcon } from '@/data/icons';
import { theme } from '@/data/themes';
import { FieldsContainer } from './styled/roomForm';
import { isoShortDate } from '@/services/getISODate';

const AgregarJuego = () => {
	const [addGameView, setAddGameView] = useState(false);
	const min_date = isoShortDate();

	const toggleState = () => {
		setAddGameView((prevState) => !prevState);
	};

	return (
		<>
			{!addGameView ? (
				<Buttom onClick={toggleState} icoUrl={expandIcon}>
					Agregar Juego
				</Buttom>
			) : (
				<div>
					<Separator width={100} color={theme.dark.borders.secundary} />
					<SubHeaderBar
						icon={expandIcon}
						size={20}
						onClick={toggleState}
						style={{
							position: 'relative',
							transform: 'rotate(180deg)',
						}}
					>
						Datos Juego
					</SubHeaderBar>
					<FieldsContainer>
						<FormikInputValue
							name='beginsAtDate'
							title='Fecha y Hora de Inicio Programado'
							type='datetime-local'
							min={min_date}
							size={1}
						/>
					</FieldsContainer>
				</div>
			)}
		</>
	);
};

export default AgregarJuego;
