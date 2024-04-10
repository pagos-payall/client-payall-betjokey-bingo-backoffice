import { useState } from 'react';
import NoInfoComp from './NoInfoComp';
import AgregarJuego from './AgregarJuego';

const JuegoAsociado = ({ value, status }) => {
	const [addGameView, setAddGameView] = useState(false);

	const handleClick = () => setAddGameView((val) => !val);

	return (
		<>
			{status !== 'archive' && (
				<>
					{value && !addGameView && (
						<NoInfoComp content='No hay juego asignado' />
					)}
					<div onClick={handleClick}>
						<AgregarJuego />
					</div>
				</>
			)}
		</>
	);
};

export default JuegoAsociado;
