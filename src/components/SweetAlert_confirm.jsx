import Swal from 'sweetalert2';
import { theme } from '@/data/themes';

const confirmOperationWithSweetAlert = (operation, confirmationConfig) => {
	const swalWithBootstrapButtons = Swal.mixin();
	swalWithBootstrapButtons
		.fire({
			title: confirmationConfig.title,
			text: confirmationConfig.subtitle,
			icon: 'warning',
			background: theme.dark.background.secundary,
			color: theme.dark.fonts.title_headers,
			showCancelButton: true,
			confirmButtonText: 'Si, borrala!',
			confirmButtonColor: theme.dark.colors.green,
			cancelButtonText: 'No, cancela!',
			cancelButtonColor: theme.dark.colors.red,
			reverseButtons: true,
		})
		.then((result) => {
			if (result.isConfirmed) operation();
			else if (result.dismiss === Swal.DismissReason.cancel) {
				swalWithBootstrapButtons.fire({
					title: confirmationConfig.cancelConfig.title,
					text: confirmationConfig.cancelConfig.subtitle,
					icon: 'error',
					background: theme.dark.background.secundary,
					color: theme.dark.fonts.title_headers,
					confirmButtonColor: theme.dark.colors.green,
				});
			}
		});
};

export default confirmOperationWithSweetAlert;
