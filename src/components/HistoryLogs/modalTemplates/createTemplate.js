import { theme } from '@/data/themes';

const createTemplate = (data) => {
	const { username, date, operation, operationDetails } = data;
	const {
		room_id,
		room_name,
		host_username,
		game,
		porcentajes_recoleccion,
		taxes,
		rewardsDistribution,
	} = operationDetails;

	let taxesHTML = `
	<div style="
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		align-items: start;
		gap: 1.5px;
		padding-left: 10px;
	"></div>
	`;

	taxes.map(({ name, value }) => {
		let string = `<p><strong>${name}:</strong> ${value}</p>`;
		taxesHTML = taxesHTML.replace('</div>', `${string}</div>`);
	});

	let template = `
	<div style="padding:10px; margin:0px; display: flex; flex-direction: column; align-items: center; gap: 10px">
		<div style="display: flex; gap: 5px; justify-content: space-around; flex-wrap: wrap;">
			<p style="flex-grow: 1; text-align: left; font-size: 0.75em"><strong>Nombre de usuario:</strong> ${username}</p>
			<p style="flex-grow: 1; text-align: left; font-size: 0.75em"><strong>Operación:</strong> ${operation}</p>
			<p style="flex-grow: 1; text-align: left; font-size: 0.75em"><strong>Fecha:</strong> ${new Date(
				date
			).toString()}</p>
		</div>
		<div style="
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
		">
			<h5>Detalles de la operación:</h5>
			<p><strong>Room ID:</strong> ${room_id}</p>
			<p><strong>Nombre de usuario anfitrión:</strong> ${host_username}</p>
			<p><strong>Nombre de la sala:</strong> ${room_name}</p>

			<div>
				<p><strong>Juego:</strong></p>
				<div style="
					display: flex;
					flex-direction: column;
					justify-content: flex-start;
					align-items: start;
					gap: 1.5px;
					padding-left: 10px;
				">
					<p><strong>Tipo de juego:</strong> ${game.typeOfGame}</p>
					<p><strong>Tipo de jugada:</strong> ${game.play}</p>
					<p><strong>Precio del carton:</strong> ${game.card_price}</p>
					<p><strong>Cantidad min. vendida para partida:</strong> ${game.min_value}</p>
				</div>
			</div>

			<div>
				<p><strong>Porcentajes de recolección:</strong></p>
				<div style="
					display: flex;
					flex-direction: column;
					justify-content: flex-start;
					align-items: start;
					gap: 1.5px;
					padding-left: 10px;
				">
					<p><strong>Comision:</strong> ${porcentajes_recoleccion.comision}</p>
					<p><strong>Comision:</strong> ${porcentajes_recoleccion.pote_especial}</p>
					<p><strong>Comision:</strong> ${porcentajes_recoleccion.premios}</p>
				</div>
			</div>

			<div style="
				display: flex;
				flex-direction: column;
				justify-content: flex-start;
				align-items: start;
				gap: 1.5px;
				padding-left: 10px;
			">
				<p><strong>Porcentajes de recolección:</strong></p>
				<div>
					<p><strong>Comision:</strong> ${porcentajes_recoleccion.comision}</p>
					<p><strong>Pote especial:</strong> ${porcentajes_recoleccion.pote_especial}</p>
					<p><strong>Premios:</strong> ${porcentajes_recoleccion.premios}</p>
				</div>
			</div>

			<div>
				<p>
					<strong>Impuestos:</strong>
				</p>
				<p>No definidos</p>	
			</div>
			<div>
			
			<p><strong>Distribución de recompensas:</strong></p>				
				<div style="
					display: flex;
					flex-direction: column;
					justify-content: flex-start;
					align-items: start;
					gap: 1.5px;
					padding-left: 10px;
				">
					<p><strong>Carton Completo:</strong> ${rewardsDistribution.carton_full}</p>
					<p><strong>Lineas Completa:</strong> ${rewardsDistribution.linea_full}</p>
					<p><strong>% premio a carton:</strong> ${
						rewardsDistribution.porcen_premio_asignado_carton
					}</p>
					
					<p><strong>% premio a lineas:</strong> ${
						rewardsDistribution.porcen_premio_asignado_linea
					}</p>
					<p><strong>Cantidad de cartones premiados:</strong> ${
						rewardsDistribution.cant_cartones_premiados
					}</p>
					<p><strong>Cantidad de lineas premiadas:</strong> ${
						rewardsDistribution.cant_lineas_premiadas
					}</p>
				</div>
			</div>
		</div>
	</div>
	`;

	if (taxes.length > 0)
		template = template.replace('<p>No definidos</p>', taxesHTML);

	return template;
};

export default createTemplate;
