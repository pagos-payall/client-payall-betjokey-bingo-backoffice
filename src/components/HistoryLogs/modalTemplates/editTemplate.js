import { theme } from '@/data/themes';

const buildTemplate = (array) => {
	let html = '';

	array.map(([key, value]) => {
		let string;

		if (typeof value === 'object' || Array.isArray(value)) {
			const array2 = !Array.isArray(value) ? Object.entries(value) : value;
			let string2 = `<div style="
			display: flex;
			flex-direction: column;
			justify-content: flex-start;
			align-items: start;
			gap: 1.5px;
			padding-left: 10px;
		"></div>`;

			string = `
			<div>
				<p><strong>${key}:</strong></p>
			</div>`;

			const templateRow = (title, val) =>
				`<p><strong>${title}:</strong> ${val}</p></div>`;

			!Array.isArray(value)
				? array2.forEach(
						([key2, value2]) =>
							(string2 = string2.replace('</div>', templateRow(key2, value2)))
				  )
				: array2.forEach((item) => {
						string2 = string2.replace(
							'</div>',
							templateRow(item.name, item.value)
						);
				  });

			string = string.replace('</div>', `${string2}</div>`);
		} else string = `<p><strong>${key}:</strong> ${value}</p>`;

		html += string;
	});

	console.log(html);

	return html;
};

const editTemplate = (data) => {
	const { username, date, operation, operationDetails } = data;
	const { log_doc_new, log_doc_old } = operationDetails;
	const array_new = Object.entries(log_doc_new);
	const array_old = Object.entries(log_doc_old);

	const doc_new_html = buildTemplate(array_new);
	const doc_old_html = buildTemplate(array_old);

	let template = `
	<div style="padding:10px; margin:0px; display: flex; flex-direction: column; align-items: center; gap: 10px">
		<div style="display: flex; gap: 5px; justify-content: space-around; flex-wrap: wrap">
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
			align-items: start; 
			align-content: center; 
			display: flex;
			flex-direction: row;
			justify-content: space-around;
			flex-wrap: wrap;
			text-align: left;
		">
			<h5 style="width: 100%">Detalles de la operación:</h5>
			<div style="flex-grow: 1; ">
				<h6>Valores viejos:</h6>
				${doc_old_html}
			</div>
			<div style="flex-grow: 1">
					<h6>Valores actualizados:</h6>
					${doc_new_html}
			</div>
		</div>
	</div>
	`;

	return template;
};

export default editTemplate;
