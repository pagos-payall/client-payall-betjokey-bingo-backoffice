import Swal from 'sweetalert2'
import createTemplate from '../modals/modalTemplates/CreateEditTemplate'
import archiveTemplate from '../modals/modalTemplates/DefaultTemplate'
import editTemplate from '../modals/modalTemplates/EditTemplate'
import deleteTemplate from '../modals/modalTemplates/deleteTemplate'

const sweetAlertbasic = (data, type = false) => {
	const htmlTemplate = {
		create: createTemplate,
		delete: deleteTemplate,
		archive: archiveTemplate,
		unarchive: archiveTemplate,
		edit: editTemplate,
	}

	const titleContent = {
		1: `Reporte sala \n ${data.room_name}-${data.room_id}`,
		2: `Reporte de sala ${data.room_name}`,
	}
	const cursor = data.operation !== 'delete' ? 1 : 2

	!type
		? Swal.fire({
				title: titleContent[cursor],
				html: htmlTemplate[data.operation](data),
		  })
		: Swal.fire({
				title: 'Usuario Editado',
				html: '<div></div>',
		  })
}

export default sweetAlertbasic
