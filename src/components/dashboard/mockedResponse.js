// Mock data para financeSummary
const mockFinancialSummary = {
	totales: {
		recaudacionBruta: 92310000,
		recaudacionNeta: 13020000,
		totalPremios: 79300000,
		premiosBingo: 63440000,
		premiosLinea: 15860000,
		impuestos: 5200000,
		poteEspecial: 3500000,
		margenPromedio: 14.1,
		cantidadJuegos: 1247,
	},
	tendencias: {
		recaudacionBruta: 8.5,
		recaudacionNeta: 12.3,
		totalPremios: 7.8,
		margen: 3.2,
	},
	distribucionTemporal: [
		// Generar datos para los últimos 30 días
		...Array.from({ length: 30 }, (_, i) => {
			const date = new Date();
			date.setDate(date.getDate() - 29 + i);

			// Calcular valores aleatorios que crecen ligeramente con el tiempo
			const factor = 0.9 + (i / 30) * 0.3; // Factor de crecimiento
			const base = 2500000 + Math.random() * 1000000;

			const recaudacionBruta = Math.round(base * factor);
			const totalPremios = Math.round(recaudacionBruta * 0.85);

			return {
				periodo: date.toISOString().split('T')[0], // Formato YYYY-MM-DD
				recaudacionBruta: recaudacionBruta,
				recaudacionNeta: recaudacionBruta - totalPremios,
				premiosBingo: Math.round(totalPremios * 0.8),
				premiosLinea: Math.round(totalPremios * 0.2),
				totalPremios: totalPremios,
				juegos: Math.round(35 + Math.random() * 15),
			};
		}),
	],
	distribucionPorSala: [
		{
			salaId: 'sala1',
			nombreSala: 'Sala Principal',
			recaudacionBruta: 32510000,
			recaudacionNeta: 4551000,
			premiosBingo: 22757000,
			premiosLinea: 5202000,
			totalPremios: 27959000,
			juegos: 412,
		},
		{
			salaId: 'sala2',
			nombreSala: 'Sala VIP',
			recaudacionBruta: 28470000,
			recaudacionNeta: 3985800,
			premiosBingo: 19929000,
			premiosLinea: 4555700,
			totalPremios: 24484700,
			juegos: 376,
		},
		{
			salaId: 'sala3',
			nombreSala: 'Sala Express',
			recaudacionBruta: 18920000,
			recaudacionNeta: 2648800,
			premiosBingo: 13244000,
			premiosLinea: 3027200,
			totalPremios: 16271200,
			juegos: 298,
		},
		{
			salaId: 'sala4',
			nombreSala: 'Sala Regular',
			recaudacionBruta: 12410000,
			recaudacionNeta: 1737400,
			premiosBingo: 8687000,
			premiosLinea: 1985600,
			totalPremios: 10672600,
			juegos: 161,
		},
	],
	periodoConsultado: {
		inicio: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
		fin: new Date().toISOString(),
		granularidad: 'day',
	},
};

// Mock data para gameAnalytics
export const mockGameAnalytics = {
	metricas_victoria: {
		porcentajeVictoriasCompartidas: {
			total: 12.3,
			bingo: 8.5,
			linea: 16.2,
		},
		tiempoPromedio: {
			hastaLinea: 8.2,
			hastaBingo: 14.5,
		},
		promedioBolasPorJuego: 53,
	},
	distribucion_numeros: {
		completa: Array.from({ length: 90 }, (_, i) => {
			// Crear distribución de frecuencias con algunos sesgos para simular patrones
			const baseFreq = 1000 + Math.random() * 300;

			// Crear algunos "puntos calientes" en ciertos rangos
			let multiplier = 1.0;
			if (i < 10) multiplier = 1.1; // Números iniciales
			if (i >= 40 && i < 50) multiplier = 1.15; // Rango medio
			if (i >= 80) multiplier = 0.9; // Números finales

			// Agregar variación aleatoria individual
			const indivMultiplier = 0.8 + Math.random() * 0.4;

			const freq = Math.round(baseFreq * multiplier * indivMultiplier);

			return {
				numero: i + 1,
				frecuencia: freq,
				porcentaje: (freq / 100000) * 100,
			};
		}),

		porRango: [
			{
				rango: '1-10',
				frecuenciaPromedio: 1130,
				porcentajePromedio: 5.65,
			},
			{
				rango: '11-20',
				frecuenciaPromedio: 1080,
				porcentajePromedio: 5.4,
			},
			{
				rango: '21-30',
				frecuenciaPromedio: 1050,
				porcentajePromedio: 5.25,
			},
			{
				rango: '31-40',
				frecuenciaPromedio: 1100,
				porcentajePromedio: 5.5,
			},
			{
				rango: '41-50',
				frecuenciaPromedio: 1150,
				porcentajePromedio: 5.75,
			},
			{
				rango: '51-60',
				frecuenciaPromedio: 1070,
				porcentajePromedio: 5.35,
			},
			{
				rango: '61-70',
				frecuenciaPromedio: 1030,
				porcentajePromedio: 5.15,
			},
			{
				rango: '71-80',
				frecuenciaPromedio: 1010,
				porcentajePromedio: 5.05,
			},
			{
				rango: '81-90',
				frecuenciaPromedio: 990,
				porcentajePromedio: 4.95,
			},
		],

		top: {
			masFrecuentes: [
				{ numero: 27, frecuencia: 1245, porcentaje: 6.22 },
				{ numero: 42, frecuencia: 1231, porcentaje: 6.15 },
				{ numero: 11, frecuencia: 1218, porcentaje: 6.09 },
				{ numero: 88, frecuencia: 1205, porcentaje: 6.02 },
				{ numero: 36, frecuencia: 1198, porcentaje: 5.99 },
			],
			menosFrecuentes: [
				{ numero: 71, frecuencia: 875, porcentaje: 4.37 },
				{ numero: 64, frecuencia: 882, porcentaje: 4.41 },
				{ numero: 90, frecuencia: 889, porcentaje: 4.44 },
				{ numero: 3, frecuencia: 895, porcentaje: 4.47 },
				{ numero: 59, frecuencia: 902, porcentaje: 4.51 },
			],
		},
	},
	juegos_activos: [
		{
			roomId: 'sala1',
			estado: 'running',
			duracion: 7.2,
			bolasExtraidas: 10,
			tieneGanadorLinea: false,
			tieneGanadorBingo: false,
		},
		{
			roomId: 'sala2',
			estado: 'running',
			duracion: 4.6,
			bolasExtraidas: 6,
			tieneGanadorLinea: false,
			tieneGanadorBingo: false,
		},
		{
			roomId: 'sala5',
			estado: 'running',
			duracion: 12.8,
			bolasExtraidas: 25,
			tieneGanadorLinea: true,
			tieneGanadorBingo: false,
		},
	],
	periodoConsultado: {
		inicio: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
		fin: new Date().toISOString(),
		totalPartidas: 1247,
	},
};

// Mock data para roomPerformance
const mockRoomPerformance = {
	metricas_globales: {
		totalPartidas: 458,
		promedioCartonesVendidos: 750,
		tiempoPromedioPartida: '15.30',
		totalCartonesVendidos: 12540,
	},
	salas_activas: [
		{
			id: 'sala1',
			nombre: 'Sala Principal',
			estado: 'active',
			estadoJuego: 'running',
			host: 'host_principal',
			usuariosConectados: 324,
			porcentajeOcupacion: 31.2,
			cartonesVendidos: 1240,
			tiempoRestante: -420, // 7 minutos en juego
			configuracion: {
				precioCarton: 20,
				tipoJuego: 'Bingo 90 - 12000',
			},
			estadoPartida: {
				bolas: [5, 10, 17, 22, 36, 47, 53, 64, 72, 85],
				ganadores: { linea: [], bingo: [] },
			},
		},
		{
			id: 'sala2',
			nombre: 'Sala VIP',
			estado: 'active',
			estadoJuego: 'running',
			host: 'host_vip',
			usuariosConectados: 487,
			porcentajeOcupacion: 42.3,
			cartonesVendidos: 2355,
			tiempoRestante: -280, // 4:40 minutos en juego
			configuracion: {
				precioCarton: 50,
				tipoJuego: 'Bingo 90 - Premium',
			},
			estadoPartida: {
				bolas: [3, 14, 28, 32, 41, 59],
				ganadores: { linea: [], bingo: [] },
			},
		},
		{
			id: 'sala3',
			nombre: 'Sala Express',
			estado: 'waiting',
			estadoJuego: 'countdown',
			host: 'host_express',
			usuariosConectados: 186,
			porcentajeOcupacion: 20.1,
			cartonesVendidos: 740,
			tiempoRestante: 42, // 42 segundos para iniciar
			configuracion: {
				precioCarton: 15,
				tipoJuego: 'Bingo 90 - Express',
			},
			estadoPartida: {
				bolas: [],
				ganadores: { linea: [], bingo: [] },
			},
		},
		{
			id: 'sala4',
			nombre: 'Sala Regular',
			estado: 'off',
			estadoJuego: null,
			host: 'host_regular',
			usuariosConectados: 0,
			porcentajeOcupacion: 0,
			cartonesVendidos: 0,
			tiempoRestante: null,
			configuracion: {
				precioCarton: 10,
				tipoJuego: 'Bingo 90 - Regular',
			},
			estadoPartida: {
				bolas: [],
				ganadores: { linea: [], bingo: [] },
			},
		},
	],
	ranking_salas: [
		{
			salaId: 'sala2',
			nombreSala: 'Sala VIP',
			partidasCompletadas: 487,
			cartonesVendidos: 152400,
			tiempoPromedio: 16.8,
			premiosTotales: 6550000,
		},
		{
			salaId: 'sala1',
			nombreSala: 'Sala Principal',
			partidasCompletadas: 512,
			cartonesVendidos: 134800,
			tiempoPromedio: 15.2,
			premiosTotales: 5780000,
		},
		{
			salaId: 'sala3',
			nombreSala: 'Sala Express',
			partidasCompletadas: 635,
			cartonesVendidos: 98700,
			tiempoPromedio: 12.5,
			premiosTotales: 3180000,
		},
		{
			salaId: 'sala4',
			nombreSala: 'Sala Regular',
			partidasCompletadas: 423,
			cartonesVendidos: 82400,
			tiempoPromedio: 17.3,
			premiosTotales: 1760000,
		},
		{
			salaId: 'sala5',
			nombreSala: 'Sala Social',
			partidasCompletadas: 196,
			cartonesVendidos: 28500,
			tiempoPromedio: 18.1,
			premiosTotales: 610000,
		},
	],
	ocupacion_historica: {
		sala1: [
			{
				fecha: '2025-03-01',
				cartonesPromedio: 220,
				usuariosPromedio: 185,
			},
			{
				fecha: '2025-03-02',
				cartonesPromedio: 245,
				usuariosPromedio: 195,
			},
			{
				fecha: '2025-03-03',
				cartonesPromedio: 210,
				usuariosPromedio: 178,
			},
			{
				fecha: '2025-03-04',
				cartonesPromedio: 230,
				usuariosPromedio: 190,
			},
			{
				fecha: '2025-03-05',
				cartonesPromedio: 270,
				usuariosPromedio: 220,
			},
		],
		sala2: [
			{
				fecha: '2025-03-01',
				cartonesPromedio: 320,
				usuariosPromedio: 285,
			},
			{
				fecha: '2025-03-02',
				cartonesPromedio: 345,
				usuariosPromedio: 305,
			},
			{
				fecha: '2025-03-03',
				cartonesPromedio: 310,
				usuariosPromedio: 278,
			},
			{
				fecha: '2025-03-04',
				cartonesPromedio: 330,
				usuariosPromedio: 290,
			},
			{
				fecha: '2025-03-05',
				cartonesPromedio: 370,
				usuariosPromedio: 325,
			},
		],
	},
	periodoConsultado: {
		inicio: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
		fin: new Date().toISOString(),
		salaId: null,
	},
};

// Mock data para systemStatus
const mockSystemStatus = {
	timestamp: new Date().toISOString(),
	estado_general: {
		nivelAlerta: 'normal', // "normal", "warning", "critical"
		disponibilidad: 100,
		mensaje: 'Todos los sistemas operativos',
	},
	metricas_rendimiento: {
		cargaSistema: 42.3,
		usoMemoria: 65.8,
		tiempoRespuesta: {
			promedio: 120,
			actual: 115,
		},
		uptime: 72.5, // horas
	},
	servicios: {
		baseDatos: {
			main: true,
			records: true,
		},
		servidores: {
			web: true,
			juego: true,
			websocket: true,
		},
	},
	estadisticas: {
		salasActivas: 3,
		juegosActivos: 2,
		juegosEsperando: 1,
		sesionesActivas: 997,
		transaccionesPendientes: {
			pagosPendientes: 3,
		},
	},
	alertas_recientes: [
		{
			tipo: 'warning',
			mensaje: 'Carga del sistema superior al 50% - 10 min',
			timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
			codigo: 'HIGH_SYSTEM_LOAD',
			detalles: 'CPU utilization at 78%',
		},
		{
			tipo: 'info',
			mensaje: 'Reinicio programado - Sistema de pagos',
			timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
			codigo: 'SCHEDULED_MAINTENANCE',
			detalles: 'Payment system will be offline between 2-4 AM',
		},
	],
	rendimiento_historico: {
		timestamps: Array.from({ length: 12 }, (_, i) =>
			new Date(Date.now() - (11 - i) * 10 * 60 * 1000).toISOString()
		),
		cpu: [45, 42, 38, 41, 46, 50, 48, 45, 42, 40, 38, 42],
		memoria: [62, 65, 63, 67, 70, 68, 65, 64, 62, 60, 63, 65],
		respuesta: [125, 130, 118, 122, 135, 142, 128, 120, 115, 110, 118, 115],
	},
	capacidad: {
		usuarios: {
			activos: 997,
			capacidadMaxima: 10000,
			porcentajeUso: 9.97,
		},
		salas: {
			activas: 3,
			capacidadMaxima: 100,
			porcentajeUso: 3,
		},
		juegos: {
			activos: 3,
			capacidadMaxima: 100,
			porcentajeUso: 3,
		},
	},
};

// // Mock data para usersMetrics
const mockUserMetrics = {
	metricas_actuales: {
		usuariosActivos: 3245,
		nuevosUsuarios: 128,
		tasaRetencion: '68.50',
		promedioCartonesUsuario: '4.20',
		tiempoPromedioSesion: '45.80', // en minutos
	},
	evolucionTemporal: [
		// Generar datos para los últimos 14 días con tendencia creciente
		...Array.from({ length: 14 }, (_, i) => {
			const date = new Date();
			date.setDate(date.getDate() - 13 + i);

			// Usuarios con tendencia creciente y fluctuación diaria
			const baseUsers = 2800 + i * 50;
			const dailyVariation = Math.sin(i * 0.5) * 200;
			const users = Math.round(baseUsers + dailyVariation);

			return {
				periodo: date.toISOString().split('T')[0],
				usuariosUnicos: users,
			};
		}),
	],
	mapaCalorActividad: {
		matrizDatos: [
			// Domingo
			[
				5, 3, 2, 1, 0, 0, 0, 2, 8, 15, 25, 38, 45, 52, 58, 62, 70, 75, 80, 78,
				65, 45, 25, 10,
			],
			// Lunes
			[
				8, 5, 3, 1, 0, 0, 1, 5, 15, 35, 42, 40, 38, 45, 60, 85, 95, 100, 98, 85,
				70, 50, 30, 15,
			],
			// Martes
			[
				10, 5, 3, 2, 0, 0, 2, 8, 18, 30, 45, 50, 48, 52, 65, 80, 95, 105, 100,
				90, 75, 55, 30, 18,
			],
			// Miércoles
			[
				12, 8, 5, 2, 1, 0, 2, 10, 22, 35, 48, 52, 50, 55, 70, 85, 100, 110, 105,
				95, 80, 60, 35, 20,
			],
			// Jueves
			[
				15, 10, 5, 3, 1, 0, 2, 10, 25, 38, 50, 55, 52, 58, 75, 88, 105, 115,
				110, 100, 85, 65, 40, 25,
			],
			// Viernes
			[
				20, 15, 10, 5, 2, 1, 3, 12, 28, 42, 55, 60, 58, 65, 80, 95, 115, 125,
				120, 110, 95, 75, 50, 35,
			],
			// Sábado
			[
				25, 20, 15, 8, 5, 2, 5, 15, 32, 48, 60, 70, 75, 82, 90, 105, 120, 135,
				130, 120, 105, 85, 60, 40,
			],
		],
		dias: [
			'Domingo',
			'Lunes',
			'Martes',
			'Miércoles',
			'Jueves',
			'Viernes',
			'Sábado',
		],
		horas: Array.from({ length: 24 }, (_, i) => `${i}:00`),
	},
	distribucionGeografica: [
		{ pais: 'Venezuela', usuarios: 2140 },
		{ pais: 'Colombia', usuarios: 385 },
		{ pais: 'Panamá', usuarios: 210 },
		{ pais: 'Ecuador', usuarios: 175 },
		{ pais: 'España', usuarios: 120 },
		{ pais: 'Perú', usuarios: 115 },
		{ pais: 'Estados Unidos', usuarios: 60 },
		{ pais: 'México', usuarios: 40 },
	],
	periodoConsultado: {
		inicio: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
		fin: new Date().toISOString(),
		intervalo: 'hour',
	},
};
