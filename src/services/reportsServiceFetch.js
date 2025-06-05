const API_BASE_URL = process.env.API_HOST + process.env.API_URL;

const reportsServiceFetch = {
	// Generar reporte de partidas usando Fetch API
	generateReportWithFetch: async (params) => {
		try {
			// Validar parámetros requeridos
			if (!params.startDate || !params.endDate) {
				throw new Error('Las fechas de inicio y fin son obligatorias');
			}

			// Hacer la petición con fetch
			const response = await fetch(`${API_BASE_URL}/reports/games`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include', // Las cookies se envían automáticamente
				body: JSON.stringify(params),
			});

			// Verificar si la respuesta es exitosa
			if (!response.ok) {
				// Intentar obtener el mensaje de error
				const contentType = response.headers.get('content-type');
				if (contentType && contentType.includes('application/json')) {
					const errorData = await response.json();
					throw new Error(errorData.message || `Error HTTP: ${response.status}`);
				} else {
					throw new Error(`Error HTTP: ${response.status}`);
				}
			}

			// Extraer headers antes de consumir el body
			const contentDisposition = response.headers.get('content-disposition');
			const totalRecords = response.headers.get('x-total-records');
			const reportGenerated = response.headers.get('x-report-generated');

			console.log('Headers con Fetch API:');
			console.log('Content-Disposition:', contentDisposition);
			console.log('X-Total-Records:', totalRecords);
			console.log('X-Report-Generated:', reportGenerated);

			// Obtener el blob
			const blob = await response.blob();

			// Extraer el nombre del archivo
			let filename = `reporte_${new Date().toISOString().slice(0, 10)}.${params.format || 'xlsx'}`;
			if (contentDisposition) {
				const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
				if (filenameMatch && filenameMatch[1]) {
					filename = filenameMatch[1].replace(/['"]/g, '');
				}
			}

			return {
				data: blob,
				filename,
				totalRecords: totalRecords || null,
				reportGenerated: reportGenerated || null,
			};
		} catch (error) {
			console.error('Error en generateReportWithFetch:', error);
			throw error;
		}
	},
};

export default reportsServiceFetch;