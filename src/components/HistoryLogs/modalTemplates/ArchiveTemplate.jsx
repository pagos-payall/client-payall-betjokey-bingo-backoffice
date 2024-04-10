const archiveTemplate = (data) => {
	const { username, date, operation } = data;

	return `
	<div style="padding:10px; margin:0px; display: flex; flex-direction: column; align-items: center; gap: 10px">
		<div style="display: flex; gap: 5px; justify-content: space-around; flex-wrap: wrap;">
			<p style="flex-grow: 1; text-align: left; font-size: 0.75em"><strong>Nombre de usuario:</strong> ${username}</p>
			<p style="flex-grow: 1; text-align: left; font-size: 0.75em"><strong>Operación:</strong> ${operation}</p>
			<p style="flex-grow: 1; text-align: left; font-size: 0.75em"><strong>Fecha:</strong> ${new Date(
				date
			).toString()}</p>
		</div>
	</div>
	`;
};

export default archiveTemplate;
