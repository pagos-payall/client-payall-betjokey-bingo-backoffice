import { ModalContainer, ModalBox } from './ModalStyles'
import Button from '../Button'

const AlertConfirmModal = ({ modalContent, closeModal, method }) => (
	<ModalContainer>
		<ModalBox $maxHeight={'300px'}>
			<h3 style={{ fontSize: '24px' }}>{modalContent.title}</h3>
			<h5 style={{ fontSize: '15px' }}>{modalContent.subtitle || ''}</h5>
			<div style={{ display: 'flex', gap: '5px', width: '90%' }}>
				<Button color={'red'} $w={50} onClick={closeModal}>
					{modalContent.cancelText || 'Cancelar'}
				</Button>
				<Button color={'green'} $w={50} onClick={method}>
					{modalContent.confirmText || 'Aceptar'}
				</Button>
			</div>
		</ModalBox>
	</ModalContainer>
)

export default AlertConfirmModal
