export const theme = {
	dark: {
		// Propiedades existentes
		fonts: {
			title_headers: '#fff',
			subHeaders_text: '#AEBCBF',
		},
		background: {
			primary: '#111',
			secundary: '#262626',
			highLigth: '#AEBCBF',
			// Propiedades nuevas
			accent: '#00B53C', // Verde para elementos destacados
			hover: '#1a1a1a', // Color de hover
			secondary: '#262626', // Alias para secundary (con ortografía correcta)
		},
		borders: {
			primary: '#262626',
			secundary: '#AEBCBF',
			// Propiedades nuevas
			secondary: '#AEBCBF', // Alias para secundary (con ortografía correcta)
		},
		colors: {
			red: '#F25C78',
			green: '#2BD999',
			yellow: '#F2AF5C',
			purple: '#884dff',
			transparent: 'rgba(110,110,110,0.75)',
			gray: '#808080',
			blue: '#007BFF',
			text: '#FFFFFF',
		},
		filters: {
			green:
				'invert(93%) sepia(64%) saturate(886%) hue-rotate(77deg) brightness(88%) contrast(91%)',
			red: 'invert(42%) sepia(93%) saturate(469%) hue-rotate(300deg) brightness(100%) contrast(90%)',
			yellow:
				'invert(87%) sepia(71%) saturate(4226%) hue-rotate(309deg) brightness(93%) contrast(104%)',
			purple:
				'invert(32%) sepia(66%) saturate(1752%) hue-rotate(239deg) brightness(101%) contrast(110%)',
		},
		// Propiedades nuevas
		text: {
			alternative: '#1a1a1a',
			primary: '#FFFFFF', // Texto principal
			secondary: '#AEBCBF', // Texto secundario
			accent: '#00B53C', // Texto destacado (verde)
		},
		success: '#2BD999', // Color de éxito
		error: '#F25C78', // Color de error
		warning: '#F2AF5C', // Color de advertencia
	},
};
