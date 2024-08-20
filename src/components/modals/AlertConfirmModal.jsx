import { ModalContainer, ModalBox } from './ModalStyles'
import Button from '../Button'

const AlertConfirmModal = ({ method, closeModal }) => (
	<ModalContainer>
		<ModalBox maxHeight={'300px'}>
			<h3>¿Estas seguro de que deseas borrar la sala?</h3>
			<h5>¡Una vez borrada no podras recuperarla!</h5>
			<div style={{ display: 'flex', gap: '5px', width: '90%' }}>
				<Button color={'red'} w={50} onClick={closeModal}>
					Cancelar
				</Button>
				<Button color={'green'} w={50} onClick={method}>
					Borrar
				</Button>
			</div>
		</ModalBox>
	</ModalContainer>
)

export default AlertConfirmModal
