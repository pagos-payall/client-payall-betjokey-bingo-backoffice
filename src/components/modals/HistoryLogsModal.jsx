import DefaultTemplate from './modalTemplates/DefaultTemplate'
import CreateEditTemplate from './modalTemplates/CreateEditTemplate'
import { ModalBox, ModalContainer } from './ModalStyles'
import { IconComponent } from '../SubHeaderBar'
import { closeIcon } from '@/data/icons'

const HistoryLogsModal = ({ data, setModalView }) => {
	let cursor = 1

	if (data.operation === 'delete') cursor = 2
	if (data.operation === 'edit') cursor = 3

	const titleContentSalas = {
		1: `Reporte sala \n ${data.room_name}-${data.room_id}`,
		2: `Reporte de sala ${data.room_name}`,
		3: 'Sala Editada',
	}

	const titleContentUsuarios = {
		1: `Reporte usuario \n ${data.operationDetails.target_username}`,
		2: `Reporte usuario \n ${data.operationDetails.target_username}`,
		3: 'Usuario Editado',
	}

	const title = !data.operationDetails.target_username
		? titleContentSalas[cursor]
		: titleContentUsuarios[cursor]
	return (
		<ModalContainer>
			<ModalBox h={'auto'}>
				{data.operation === 'create' || data.operation === 'edit' ? (
					<CreateEditTemplate data={data} title={title} />
				) : (
					<DefaultTemplate data={data} title={title} />
				)}
				<IconComponent
					url={closeIcon}
					size={20}
					onClick={() => setModalView(false)}
					style={{
						marginRigth: 0,
					}}
				/>
			</ModalBox>
		</ModalContainer>
	)
}

export default HistoryLogsModal
