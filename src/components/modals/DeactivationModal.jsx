'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import { theme } from '@/data/themes';
import { roomService } from '@/services/roomService';
import { formatNumber } from '@/services/utilFunctions';
import useFetch from '@/hooks/useFetch';

const ModalOverlay = styled.div`
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background: rgba(0, 0, 0, 0.7);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1000;
	animation: fadeIn 0.2s ease-out;

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
`;

const ModalContent = styled.div`
	background: ${theme.dark.background.secundary};
	border-radius: 12px;
	padding: 0;
	width: 90%;
	max-width: 500px;
	max-height: 85vh;
	display: flex;
	flex-direction: column;
	box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
	animation: slideIn 0.3s ease-out;

	@keyframes slideIn {
		from {
			transform: translateY(-20px);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}
`;

const ModalHeader = styled.div`
	background: ${theme.dark.background.primary};
	padding: 20px;
	border-bottom: 1px solid ${theme.dark.borders.table};
	border-radius: 12px 12px 0 0;
	display: flex;
	justify-content: space-between;
	align-items: center;
	flex-shrink: 0;
`;

const ModalTitle = styled.h3`
	color: ${theme.dark.fonts.title_headers};
	font-size: 20px;
	margin: 0;
	display: flex;
	align-items: center;
	gap: 10px;
`;

const CloseButton = styled.button`
	background: none;
	border: none;
	color: ${theme.dark.fonts.light_text};
	font-size: 24px;
	cursor: pointer;
	padding: 0;
	width: 32px;
	height: 32px;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 4px;
	transition: all 0.2s;

	&:hover {
		background: rgba(255, 255, 255, 0.1);
	}
`;

const ModalBody = styled.div`
	padding: 20px;
	overflow-y: auto;
	flex: 1;
	
	/* Personalizar scrollbar */
	&::-webkit-scrollbar {
		width: 8px;
	}
	
	&::-webkit-scrollbar-track {
		background: ${theme.dark.background.primary};
		border-radius: 4px;
	}
	
	&::-webkit-scrollbar-thumb {
		background: ${theme.dark.borders.table};
		border-radius: 4px;
		
		&:hover {
			background: ${theme.dark.colors.gray};
		}
	}
`;

const ValidationSection = styled.div`
	background: ${theme.dark.background.primary};
	border-radius: 8px;
	padding: 16px;
	margin-bottom: 20px;
	border: 1px solid ${theme.dark.borders.table};
`;

const ValidationTitle = styled.h4`
	color: ${theme.dark.fonts.title_headers};
	font-size: 16px;
	margin: 0 0 12px 0;
	display: flex;
	align-items: center;
	gap: 8px;
`;

const ValidationItem = styled.div`
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 8px 0;
	color: ${({ valid }) =>
		valid ? theme.dark.colors.green : theme.dark.colors.red};
`;

const ValidationIcon = styled.span`
	font-size: 18px;
`;

const ValidationText = styled.span`
	font-size: 14px;
`;

const DeactivationOption = styled.div`
	background: ${theme.dark.background.primary};
	border: 2px solid
		${({ selected }) =>
			selected ? theme.dark.colors.purple : theme.dark.borders.table};
	border-radius: 8px;
	padding: 16px;
	margin-bottom: 16px;
	cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
	opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
	transition: all 0.2s;

	&:hover:not(:disabled) {
		border-color: ${({ disabled }) =>
			disabled ? theme.dark.borders.table : theme.dark.colors.purple};
		transform: ${({ disabled }) => (disabled ? 'none' : 'translateY(-2px)')};
	}
`;

const OptionHeader = styled.div`
	display: flex;
	align-items: center;
	gap: 12px;
	margin-bottom: 8px;
`;

const OptionIcon = styled.span`
	font-size: 24px;
	color: ${({ type }) =>
		type === 'immediate' ? theme.dark.colors.red : theme.dark.colors.yellow};
`;

const OptionTitle = styled.h5`
	color: ${theme.dark.fonts.title_headers};
	font-size: 16px;
	margin: 0;
`;

const OptionDescription = styled.p`
	color: ${theme.dark.fonts.light_text};
	font-size: 14px;
	margin: 0;
	line-height: 1.5;
	word-wrap: break-word;
	overflow-wrap: break-word;
`;

const ReasonSection = styled.div`
	margin-top: 20px;
`;

const Label = styled.label`
	display: block;
	color: ${theme.dark.fonts.title_headers};
	font-size: 14px;
	margin-bottom: 8px;
`;

const TextArea = styled.textarea`
	width: 100%;
	min-height: 80px;
	padding: 12px;
	background: ${theme.dark.background.primary};
	border: 1px solid ${theme.dark.borders.input_border};
	border-radius: 6px;
	color: ${theme.dark.fonts.light_text};
	font-size: 14px;
	resize: vertical;
	font-family: inherit;

	&:focus {
		outline: none;
		border-color: ${theme.dark.colors.purple};
	}

	&::placeholder {
		color: ${theme.dark.fonts.placeholder};
	}
`;

const ButtonGroup = styled.div`
	display: flex;
	gap: 12px;
	justify-content: flex-end;
	padding: 20px;
	background: ${theme.dark.background.secundary};
	border-top: 1px solid ${theme.dark.borders.table};
	border-radius: 0 0 12px 12px;
	flex-shrink: 0;
`;

const Button = styled.button`
	padding: 10px 20px;
	border: none;
	border-radius: 6px;
	font-size: 14px;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s;
	display: flex;
	align-items: center;
	gap: 8px;

	&:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
`;

const CancelButton = styled(Button)`
	background: ${theme.dark.background.primary};
	color: ${theme.dark.fonts.light_text};
	border: 1px solid ${theme.dark.borders.table};

	&:hover:not(:disabled) {
		background: rgba(255, 255, 255, 0.1);
	}
`;

const ConfirmButton = styled(Button)`
	background: ${({ type }) =>
		type === 'immediate' ? theme.dark.colors.red : theme.dark.colors.yellow};
	color: white;

	&:hover:not(:disabled) {
		opacity: 0.9;
		transform: translateY(-1px);
	}
`;

const BlockedReasons = styled.div`
	background: rgba(239, 68, 68, 0.1);
	border: 1px solid ${theme.dark.colors.red};
	border-radius: 6px;
	padding: 12px;
	margin-top: 12px;
`;

const BlockedTitle = styled.p`
	color: ${theme.dark.colors.red};
	font-size: 14px;
	font-weight: 600;
	margin: 0 0 8px 0;
`;

const BlockedList = styled.ul`
	margin: 0;
	padding-left: 20px;
	color: ${theme.dark.fonts.light_text};
	font-size: 13px;

	li {
		margin-bottom: 4px;
	}
`;

const LoadingSpinner = styled.div`
	display: inline-block;
	width: 16px;
	height: 16px;
	border: 2px solid rgba(255, 255, 255, 0.3);
	border-radius: 50%;
	border-top-color: white;
	animation: spin 0.8s linear infinite;

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
`;

const DeactivationModal = ({ isOpen, onClose, room, onConfirm }) => {
	const [selectedOption, setSelectedOption] = useState('scheduled');
	const [reason, setReason] = useState('');
	const [canDeactivateImmediately, setCanDeactivateImmediately] =
		useState(false);
	const [validationData, setValidationData] = useState(null);
	const [loading, setLoading] = useState(false);
	const [checking, setChecking] = useState(true);
	const { fetchAPICall } = useFetch();

	useEffect(() => {
		const checkDeactivationOptions = async () => {
			setChecking(true);
			try {
				const data = await fetchAPICall(
					`/bingo/rooms/${room.room_id}/can-immediate-deactivation`,
					'get'
				);

				if (data) {
					setCanDeactivateImmediately(data.canDeactivateImmediately);
					setValidationData(data);

					// Si no puede desactivar inmediatamente, establecer opción programada por defecto
					if (!data.canDeactivateImmediately) {
						setSelectedOption('scheduled');
					}
				}
			} catch (error) {
				console.error('Error checking deactivation options:', error);
			} finally {
				setChecking(false);
			}
		};

		if (isOpen && room) {
			checkDeactivationOptions();
		}
	}, [isOpen, room, fetchAPICall]);

	const handleConfirm = async () => {
		if (!reason.trim()) {
			toast.error('Por favor, ingresa un motivo para la desactivación');
			return;
		}

		setLoading(true);
		try {
			const data = {
				reason: reason.trim(),
				immediate_deactivation: selectedOption === 'immediate',
			};

			await onConfirm(data);
			onClose();
			setReason('');
			setSelectedOption('scheduled');
		} catch (error) {
			console.error('Error al programar desactivación:', error);
		} finally {
			setLoading(false);
		}
	};

	if (!isOpen) return null;

	return (
		<ModalOverlay onClick={onClose}>
			<ModalContent onClick={(e) => e.stopPropagation()}>
				<ModalHeader>
					<ModalTitle>⚡ Desactivar Sala</ModalTitle>
					<CloseButton onClick={onClose}>×</CloseButton>
				</ModalHeader>

				<ModalBody>
					{checking ? (
						<div style={{ textAlign: 'center', padding: '40px' }}>
							<LoadingSpinner />
							<p
								style={{
									marginTop: '16px',
									color: theme.dark.fonts.light_text,
								}}
							>
								Verificando estado de la sala...
							</p>
						</div>
					) : (
						<>
							{/* Sección de validación */}
							<ValidationSection>
								<ValidationTitle>📊 Estado Actual de la Sala</ValidationTitle>

								<ValidationItem
									valid={!validationData?.currentState?.connectedUsers}
								>
									<ValidationIcon>
										{validationData?.currentState?.connectedUsers > 0
											? '❌'
											: '✅'}
									</ValidationIcon>
									<ValidationText>
										Usuarios conectados:{' '}
										{formatNumber(
											validationData?.currentState?.connectedUsers || 0
										)}
									</ValidationText>
								</ValidationItem>

								<ValidationItem
									valid={!validationData?.currentState?.soldCards}
								>
									<ValidationIcon>
										{validationData?.currentState?.soldCards > 0 ? '❌' : '✅'}
									</ValidationIcon>
									<ValidationText>
										Cartones vendidos:{' '}
										{formatNumber(validationData?.currentState?.soldCards || 0)}
									</ValidationText>
								</ValidationItem>

								<ValidationItem
									valid={!validationData?.currentState?.hasActiveGame}
								>
									<ValidationIcon>
										{validationData?.currentState?.hasActiveGame ? '❌' : '✅'}
									</ValidationIcon>
									<ValidationText>
										Juego activo:{' '}
										{validationData?.currentState?.hasActiveGame
											? `Sí (${validationData?.currentState?.gameStatus})`
											: 'No'}
									</ValidationText>
								</ValidationItem>
							</ValidationSection>

							{/* Opciones de desactivación */}
							<DeactivationOption
								selected={selectedOption === 'scheduled'}
								onClick={() => setSelectedOption('scheduled')}
							>
								<OptionHeader>
									<OptionIcon type='scheduled'>🕐</OptionIcon>
									<OptionTitle>Desactivación Programada</OptionTitle>
								</OptionHeader>
								<OptionDescription>
									La sala se desactivará automáticamente después de que termine
									el juego actual. Los usuarios serán notificados y no se
									permitirán nuevas ventas.
								</OptionDescription>
							</DeactivationOption>

							<DeactivationOption
								selected={selectedOption === 'immediate'}
								disabled={!canDeactivateImmediately}
								onClick={() =>
									canDeactivateImmediately && setSelectedOption('immediate')
								}
							>
								<OptionHeader>
									<OptionIcon type='immediate'>⚡</OptionIcon>
									<OptionTitle>Desactivación Inmediata</OptionTitle>
								</OptionHeader>
								<OptionDescription>
									La sala se desactivará de inmediato. Solo disponible cuando no
									hay usuarios conectados, cartones vendidos o juegos activos.
								</OptionDescription>

								{!canDeactivateImmediately && validationData?.reasons && (
									<BlockedReasons>
										<BlockedTitle>
											No disponible por las siguientes razones:
										</BlockedTitle>
										<BlockedList>
											{validationData.reasons.map((reason, index) => (
												<li key={index}>{reason}</li>
											))}
										</BlockedList>
									</BlockedReasons>
								)}
							</DeactivationOption>

							{/* Campo de motivo */}
							<ReasonSection>
								<Label>Motivo de desactivación *</Label>
								<TextArea
									value={reason}
									onChange={(e) => setReason(e.target.value)}
									placeholder='Ingresa el motivo de la desactivación (ej: Mantenimiento programado, Actualización del sistema, etc.)'
									maxLength={200}
								/>
								<p
									style={{
										fontSize: '12px',
										color: theme.dark.fonts.placeholder,
										marginTop: '4px',
									}}
								>
									{reason.length}/200 caracteres
								</p>
							</ReasonSection>
						</>
					)}
				</ModalBody>
				
				{/* Botones de acción fuera del ModalBody */}
				{!checking && (
					<ButtonGroup>
						<CancelButton onClick={onClose} disabled={loading}>
							Cancelar
						</CancelButton>
						<ConfirmButton
							type={selectedOption}
							onClick={handleConfirm}
							disabled={loading || !reason.trim()}
						>
							{loading && <LoadingSpinner />}
							{loading
								? 'Procesando...'
								: selectedOption === 'immediate'
								? 'Desactivar Ahora'
								: 'Programar Desactivación'}
						</ConfirmButton>
					</ButtonGroup>
				)}
			</ModalContent>
		</ModalOverlay>
	);
};

export default DeactivationModal;
