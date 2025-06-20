import TestComponents from '@/app/test-components/page';
import axios from '@/config/axiosConfig';

const reportsService = {
	// Verificar el estado del servicio de reportes
	checkHealth: async () => {
		try {
			const response = await axios.get(`/reports/health`);
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	// Generar reporte de partidas
	generateReport: async (params) => {
		try {
			// Validar parámetros requeridos
			if (!params.startDate || !params.endDate) {
				throw new Error('Las fechas de inicio y fin son obligatorias');
			}

			// Configurar axios para recibir el archivo como blob
			const response = await axios.post(`/reports/games`, params, {
				responseType: 'blob',
				headers: {
					'Content-Type': 'application/json',
				},
			});

			// Extraer información de los headers
			// Axios puede normalizar los nombres de los headers a minúsculas
			const headers = response.headers;
			const contentDisposition =
				headers['content-disposition'] || headers['Content-Disposition'];
			const totalRecords =
				headers['x-total-records'] || headers['X-Total-Records'];
			const reportGenerated =
				headers['x-report-generated'] || headers['X-Report-Generated'];

			// Log todos los headers para debug
			console.log('Headers recibidos con Axios:', headers);
			console.log('Todos los headers disponibles:', Object.keys(headers || {}));
			console.log('Content-Disposition:', contentDisposition);
			console.log('X-Total-Records:', totalRecords);
			console.log('X-Report-Generated:', reportGenerated);

			// NOTA: Si los headers no están disponibles, es probable que sea un problema de CORS
			// El backend necesita incluir: Access-Control-Expose-Headers: Content-Disposition, X-Total-Records, X-Report-Generated
			if (!totalRecords && !contentDisposition) {
				console.warn(
					'Headers personalizados no disponibles. Posible problema de CORS.',
					'El backend debe exponer los headers con Access-Control-Expose-Headers'
				);
			}

			// Extraer el nombre del archivo
			let filename = `reporte_${new Date().toISOString().slice(0, 10)}.${
				params.format || 'xlsx'
			}`;
			if (contentDisposition) {
				// Intentar diferentes patrones para extraer el filename
				const filenameMatch = contentDisposition.match(
					/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
				);
				if (filenameMatch && filenameMatch[1]) {
					filename = filenameMatch[1].replace(/['"]/g, '');
				}
			}

			return {
				data: response.data,
				filename,
				totalRecords: totalRecords || null,
				reportGenerated: reportGenerated || null,
			};
		} catch (error) {
			// Si la respuesta es un blob de error, convertirlo a texto
			if (error.response && error.response.data instanceof Blob) {
				const text = await error.response.data.text();

				const errorData = JSON.parse(text);

				// Crear un nuevo error con la estructura esperada
				const customError = new Error(
					errorData.message || errorData.error || 'Error al generar el reporte'
				);
				customError.response = {
					...error.response,
					data: errorData,
				};

				throw customError;
			}
		}
	},

	// Descargar el archivo generado
	downloadReport: (blob, filename) => {
		// Crear URL temporal para el blob
		const url = window.URL.createObjectURL(blob);

		// Crear elemento <a> temporal para descargar
		const link = document.createElement('a');
		link.href = url;
		link.download = filename;

		// Simular click para iniciar descarga
		document.body.appendChild(link);
		link.click();

		// Limpiar
		document.body.removeChild(link);
		window.URL.revokeObjectURL(url);
	},

	// Validar rango de fechas
	validateDateRange: (startDate, endDate) => {
		const start = new Date(startDate);
		const end = new Date(endDate);
		const today = new Date();

		// Verificar que las fechas sean válidas
		if (isNaN(start.getTime()) || isNaN(end.getTime())) {
			return {
				valid: false,
				message: 'Las fechas proporcionadas no son válidas',
			};
		}

		// Verificar que la fecha de inicio no sea posterior a la de fin
		if (start > end) {
			return {
				valid: false,
				message: 'La fecha de inicio no puede ser posterior a la fecha de fin',
			};
		}

		// Verificar que las fechas no sean futuras
		if (start > today || end > today) {
			return {
				valid: false,
				message: 'No se pueden generar reportes de fechas futuras',
			};
		}

		// Verificar que el rango no exceda 1 año
		const diffTime = Math.abs(end - start);
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		if (diffDays > 365) {
			return {
				valid: false,
				message: 'El rango de fechas no puede exceder 1 año',
			};
		}

		return { valid: true };
	},

	// Formatear fecha para el input
	formatDateForInput: (date) => {
		if (!date) return '';
		const d = new Date(date);
		const year = d.getFullYear();
		const month = String(d.getMonth() + 1).padStart(2, '0');
		const day = String(d.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	},

	// Método alternativo usando Fetch API para mejor manejo de headers
	generateReportWithFetch: async (params) => {
		try {
			const API_BASE_URL = process.env.API_HOST + process.env.API_URL;
			const response = await fetch(`${API_BASE_URL}reports/games`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include', // Esto asegura que las cookies se envíen automáticamente
				body: JSON.stringify(params),
			});

			if (!response.ok) {
				const contentType = response.headers.get('content-type');
				let errorMessage = `Error HTTP: ${response.status}`;

				try {
					if (contentType && contentType.includes('application/json')) {
						const errorData = await response.json();
						errorMessage = errorData.message || errorData.error || errorMessage;
					} else {
						// Intentar leer como texto
						const errorText = await response.text();
						if (errorText) {
							errorMessage = errorText;
						}
					}
				} catch (parseError) {
					// Si falla el parseo, usar el mensaje por defecto
					console.error('Error parsing error response:', parseError);
				}

				const customError = new Error(errorMessage);
				customError.response = {
					status: response.status,
					data: { message: errorMessage },
				};
				throw customError;
			}

			// Extraer headers antes de consumir el body
			const contentDisposition = response.headers.get('Content-Disposition');
			const totalRecords = response.headers.get('X-Total-Records');
			const reportGenerated = response.headers.get('X-Report-Generated');

			// Intentar iterar sobre todos los headers disponibles
			const allHeaders = {};
			response.headers.forEach((value, key) => {
				allHeaders[key] = value;
			});

			const blob = await response.blob();

			let filename = `reporte_${new Date().toISOString().slice(0, 10)}.${
				params.format || 'xlsx'
			}`;
			if (contentDisposition) {
				const filenameMatch = contentDisposition.match(
					/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
				);
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

export default reportsService;
