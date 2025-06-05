import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import reportsService from '@/services/reportsService';
import useUser from './useUser';

const useReports = () => {
	const [loading, setLoading] = useState(false);
	const [healthStatus, setHealthStatus] = useState(null);
	const [filters, setFilters] = useState({
		startDate: '',
		endDate: '',
		roomId: '',
		format: 'xlsx',
	});
	const [reportHistory, setReportHistory] = useState([]);
	const { level } = useUser();

	// Verificar el estado del servicio
	const checkServiceHealth = useCallback(async () => {
		try {
			setLoading(true);
			const response = await reportsService.checkHealth();
			setHealthStatus(response);
			return response;
		} catch (error) {
			console.error('Error checking service health:', error);
			toast.error('Error al verificar el servicio de reportes');
			setHealthStatus(null);
			return null;
		} finally {
			setLoading(false);
		}
	}, []);

	// Actualizar filtros
	const updateFilters = useCallback((newFilters) => {
		setFilters((prev) => ({ ...prev, ...newFilters }));
	}, []);

	// Generar y descargar reporte
	const generateReport = useCallback(async () => {
		try {
			// Validar permisos
			if (level !== 'admin' && level !== 'supervisor') {
				toast.error('No tienes permisos para generar reportes');
				return false;
			}

			// Validar fechas
			const validation = reportsService.validateDateRange(
				filters.startDate,
				filters.endDate
			);
			if (!validation.valid) {
				toast.error(validation.message);
				return false;
			}

			setLoading(true);
			toast.info('Generando reporte...', {
				autoClose: false,
				toastId: 'generating',
			});

			// Generar reporte
			const result = await reportsService.generateReport(filters);

			// Descargar archivo
			reportsService.downloadReport(result.data, result.filename);

			// Actualizar historial
			const newReport = {
				id: Date.now(),
				filename: result.filename,
				date: new Date().toISOString(),
				totalRecords: result.totalRecords,
				startDate: filters.startDate,
				endDate: filters.endDate,
				format: filters.format,
			};
			setReportHistory((prev) => [newReport, ...prev.slice(0, 9)]); // Mantener máximo 10 reportes

			toast.dismiss('generating');
			// NOTA: Si totalRecords es null, es probable que sea por restricciones CORS
			// El backend debe exponer los headers con Access-Control-Expose-Headers
			const recordsMessage = result.totalRecords 
				? `(${result.totalRecords} registros)` 
				: '';
			toast.success(
				`Reporte generado exitosamente ${recordsMessage}`
			);
			return true;
		} catch (error) {
			console.error('Error generating report:', error);
			toast.dismiss('generating');

			// Manejar errores específicos
			if (error.response) {
				switch (error.response.status) {
					case 400:
						toast.error('Datos de solicitud inválidos');
						break;
					case 401:
						toast.error('Sesión expirada. Por favor, inicia sesión nuevamente');
						break;
					case 403:
						toast.error('No tienes permisos para generar reportes');
						break;
					case 404:
						toast.warning(
							'No se encontraron datos para el período especificado'
						);
						break;
					case 500:
						toast.error('Error en el servidor. Por favor, intenta más tarde');
						break;
					default:
						toast.error(error.message || 'Error al generar el reporte');
				}
			} else {
				toast.error('Error de conexión. Verifica tu conexión a internet');
			}
			return false;
		} finally {
			setLoading(false);
		}
	}, [filters, level]);

	// Limpiar filtros
	const resetFilters = useCallback(() => {
		setFilters({
			startDate: '',
			endDate: '',
			roomId: '',
			format: 'xlsx',
		});
	}, []);

	// Establecer rango de fechas predefinido
	const setDateRange = useCallback(
		(range) => {
			const today = new Date();
			const endDate = reportsService.formatDateForInput(today);
			let startDate = '';

			switch (range) {
				case 'week':
					const weekAgo = new Date(today);
					weekAgo.setDate(weekAgo.getDate() - 7);
					startDate = reportsService.formatDateForInput(weekAgo);
					break;
				case 'month':
					const monthAgo = new Date(today);
					monthAgo.setMonth(monthAgo.getMonth() - 1);
					startDate = reportsService.formatDateForInput(monthAgo);
					break;
				case 'quarter':
					const quarterAgo = new Date(today);
					quarterAgo.setMonth(quarterAgo.getMonth() - 3);
					startDate = reportsService.formatDateForInput(quarterAgo);
					break;
				case 'year':
					const yearAgo = new Date(today);
					yearAgo.setFullYear(yearAgo.getFullYear() - 1);
					startDate = reportsService.formatDateForInput(yearAgo);
					break;
				default:
					return;
			}

			updateFilters({ startDate, endDate });
		},
		[updateFilters]
	);

	return {
		loading,
		filters,
		updateFilters,
		generateReport,
		resetFilters,
		setDateRange,
		checkServiceHealth,
		healthStatus,
		reportHistory,
	};
};

export default useReports;
