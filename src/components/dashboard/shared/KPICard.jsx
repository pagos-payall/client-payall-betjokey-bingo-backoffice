// components/dashboard/shared/KPICard.jsx
'use client';
import styled from 'styled-components';
import { theme } from '@/data/themes';

const Card = styled.div`
	background-color: ${theme.dark.background.primary};
	border-radius: 8px;
	padding: 20px;
	box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	display: flex;
	flex-direction: column;
	min-width: 200px;
	height: 100%;
`;

const Title = styled.div`
	font-size: 14px;
	color: ${theme.dark.text.secondary};
	margin-bottom: 8px;
`;

const Value = styled.div`
	font-size: 24px;
	font-weight: bold;
	color: ${theme.dark.text.primary};
	margin-bottom: 8px;
`;

const Trend = styled.div`
	display: flex;
	align-items: center;
	font-size: 12px;
	color: ${(props) =>
		props.value > 0
			? theme.dark.success
			: props.value < 0
			? theme.dark.error
			: theme.dark.text.secondary};
`;

const TrendIcon = styled.span`
	margin-right: 5px;
`;

const TrendValue = styled.span`
	font-weight: bold;
`;

const TrendLabel = styled.span`
	margin-left: 5px;
	color: ${theme.dark.text.secondary};
`;

const KPICard = ({
	title,
	value,
	trend,
	trendLabel,
	format = (value) => value,
	loading = false,
}) => {
	// Determine icon based on trend
	const getTrendIcon = (trendValue) => {
		if (trendValue > 0) return '↑';
		if (trendValue < 0) return '↓';
		return '→';
	};

	return (
		<Card>
			<Title>{title}</Title>
			{loading ? <Value>...</Value> : <Value>{format(value)}</Value>}
			{trend !== undefined && !loading && (
				<Trend value={trend}>
					<TrendIcon>{getTrendIcon(trend)}</TrendIcon>
					<TrendValue>{Math.abs(trend).toFixed(1)}%</TrendValue>
					<TrendLabel>{trendLabel || 'vs. período anterior'}</TrendLabel>
				</Trend>
			)}
		</Card>
	);
};

export default KPICard;
