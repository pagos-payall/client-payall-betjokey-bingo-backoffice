import Swal from 'sweetalert2';
import createTemplate from './modalTemplates/createTemplate';
import archiveTemplate from './modalTemplates/ArchiveTemplate';
import editTemplate from './modalTemplates/editTemplate';
import deleteTemplate from './modalTemplates/deleteTemplate';

const sweetAlertbasic = (data) => {
	const htmlTemplate = {
		create: createTemplate,
		delete: deleteTemplate,
		archive: archiveTemplate,
		unarchive: archiveTemplate,
		edit: editTemplate,
	};

	const titleContent = {
		1: `Reporte sala \n ${data.room_name}-${data.room_id}`,
		2: `Reporte de sala ${data.room_name}`,
	};
	const cursor = data.operation !== 'delete' ? 1 : 2;

	Swal.fire({
		title: titleContent[cursor],
		html: htmlTemplate[data.operation](data),
	});
};

export default sweetAlertbasic;
