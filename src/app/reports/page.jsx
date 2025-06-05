'use client';
import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { theme } from '@/data/themes';
import LoadingCircle from '@/components/LoadingCircle';
import ReportsPanel from '@/components/reports/ReportsPanel';
import useUser from '@/hooks/useUser';

const Container = styled.div`
	background: ${theme.dark.background.primary};
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 20px;
	height: 100%;
	width: 100%;
	overflow-y: auto;
`;

const Title = styled.h1`
	color: ${theme.dark.text.primary};
	font-size: 1.8rem;
	margin-bottom: 20px;
	text-align: left;
	margin-right: auto;
`;

const AccessDenied = styled.div`
	color: ${theme.dark.text.primary};
	text-align: center;
	padding: 40px;

	h2 {
		font-size: 1.5rem;
		margin-bottom: 10px;
	}

	p {
		color: ${theme.dark.text.secondary};
	}
`;

export default function ReportsPage() {
	const [loading, setLoading] = useState(true);
	const [hasAccess, setHasAccess] = useState(false);
	const { level } = useUser();

	useEffect(() => {
		const checkAccess = async () => {
			try {
				// Verificar si el usuario tiene rol admin o supervisor
				if (level === 'admin' || level === 'supervisor') {
					setHasAccess(true);
				} else {
					setHasAccess(false);
				}
			} catch (error) {
				console.error('Error checking user access:', error);
				setHasAccess(false);
			} finally {
				setLoading(false);
			}
		};

		checkAccess();
	}, [level]);

	if (loading) {
		return (
			<Container>
				<LoadingCircle />
			</Container>
		);
	}

	if (!hasAccess) {
		return (
			<Container>
				<AccessDenied>
					<h2>Acceso Denegado</h2>
					<p>No tienes permisos para acceder a esta sección.</p>
					<p>
						Solo usuarios con rol de administrador o supervisor pueden generar
						reportes.
					</p>
				</AccessDenied>
			</Container>
		);
	}

	return (
		<Container>
			<Title>Generación de Reportes</Title>
			<ReportsPanel />
		</Container>
	);
}
