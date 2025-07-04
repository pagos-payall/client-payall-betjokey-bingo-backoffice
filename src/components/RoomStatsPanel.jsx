import React from 'react';
import styled from 'styled-components';
import { useFormattedStatistics } from '@/hooks/useRoomStatistics';
import { formatNumber } from '@/services/utilFunctions';

const StatsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e9ecef;
`;

const StatsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 15px;
  border-bottom: 1px solid #e9ecef;
`;

const StatsTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
`;

const LastUpdated = styled.span`
  font-size: 12px;
  color: #6c757d;
  font-style: italic;
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
`;

const MetricCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
`;

const MetricLabel = styled.div`
  font-size: 12px;
  color: #6c757d;
  margin-bottom: 8px;
  text-transform: uppercase;
  font-weight: 500;
`;

const MetricValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin-bottom: 4px;
`;

const MetricSubtitle = styled.div`
  font-size: 14px;
  color: #6c757d;
  margin-bottom: 8px;
`;

const MetricTrend = styled.div`
  font-size: 12px;
  font-weight: 500;
  color: ${props => {
    if (props.positive) return '#28a745';
    if (props.negative) return '#dc3545';
    return '#6c757d';
  }};
  display: flex;
  align-items: center;
  gap: 4px;
`;

const StatusBadge = styled.span`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  background: ${props => {
    switch (props.status) {
      case 'waiting': return '#fff3cd';
      case 'in_progress': return '#d4edda';
      case 'countdown': return '#ffeaa7';
      case 'finishing': return '#d1ecf1';
      case 'finished': return '#f8d7da';
      default: return '#e9ecef';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'waiting': return '#856404';
      case 'in_progress': return '#155724';
      case 'countdown': return '#b8860b';
      case 'finishing': return '#0c5460';
      case 'finished': return '#721c24';
      default: return '#495057';
    }
  }};
`;

const ProgressSection = styled.div`
  background: white;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e9ecef;
`;

const ProgressTitle = styled.h4`
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
`;

const ProgressItem = styled.div`
  margin-bottom: 16px;
  &:last-child {
    margin-bottom: 0;
  }
`;

const ProgressHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const ProgressLabel = styled.span`
  font-size: 12px;
  color: #6c757d;
  font-weight: 500;
`;

const ProgressValues = styled.span`
  font-size: 12px;
  color: #333;
  font-weight: 600;
`;

const ProgressBar = styled.div`
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: ${props => {
    if (props.percentage >= 100) return '#28a745';
    if (props.percentage >= 50) return '#ffc107';
    return '#dc3545';
  }};
  border-radius: 4px;
  transition: width 0.3s ease;
`;

const FinancialGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin-top: 16px;
`;

const FinancialItem = styled.div`
  background: white;
  border-radius: 6px;
  padding: 12px;
  border: 1px solid #e9ecef;
  text-align: center;
`;

const FinancialLabel = styled.div`
  font-size: 10px;
  color: #6c757d;
  margin-bottom: 4px;
  text-transform: uppercase;
`;

const FinancialValue = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #333;
`;

const ErrorMessage = styled.div`
  background: #f8d7da;
  color: #721c24;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #f5c6cb;
  text-align: center;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  color: #6c757d;
`;

const RoomStatsPanel = ({ roomId, options = {} }) => {
  const { statistics, loading, error, lastUpdated } = useFormattedStatistics(roomId, options);

  if (loading) {
    return (
      <StatsContainer>
        <LoadingSpinner>
          <div>⏳ Cargando estadísticas...</div>
        </LoadingSpinner>
      </StatsContainer>
    );
  }

  if (error) {
    return (
      <StatsContainer>
        <ErrorMessage>
          Error al cargar estadísticas: {error.message}
        </ErrorMessage>
      </StatsContainer>
    );
  }

  if (!statistics) {
    return (
      <StatsContainer>
        <ErrorMessage>
          No hay estadísticas disponibles para esta sala
        </ErrorMessage>
      </StatsContainer>
    );
  }

  const { current_metrics, financial_breakdown, requirements_status, daily_stats, trends } = statistics;

  return (
    <StatsContainer>
      <StatsHeader>
        <StatsTitle>📊 Estadísticas de Sala {roomId}</StatsTitle>
        {lastUpdated && (
          <LastUpdated>
            Actualizado: {lastUpdated.toLocaleTimeString()}
          </LastUpdated>
        )}
      </StatsHeader>

      {/* Métricas Actuales */}
      <MetricsGrid>
        <MetricCard>
          <MetricLabel>Usuarios Conectados</MetricLabel>
          <MetricValue>{formatNumber(current_metrics.connected_users)}</MetricValue>
          <MetricSubtitle>Ocupación: {current_metrics.occupancy_formatted}</MetricSubtitle>
          {trends && (
            <MetricTrend positive={trends.users_trend === 'increasing'} negative={trends.users_trend === 'decreasing'}>
              {trends.users_display.icon} {trends.users_display.text} ({trends.users_change_percentage}%)
            </MetricTrend>
          )}
        </MetricCard>

        <MetricCard>
          <MetricLabel>Cartones Vendidos</MetricLabel>
          <MetricValue>{formatNumber(current_metrics.sold_cards)}</MetricValue>
          <MetricSubtitle>
            de {formatNumber(current_metrics.total_cards)} disponibles
          </MetricSubtitle>
          <MetricTrend>
            {((current_metrics.sold_cards / current_metrics.total_cards) * 100).toFixed(1)}% vendidos
          </MetricTrend>
        </MetricCard>

        <MetricCard>
          <MetricLabel>Recaudación Actual</MetricLabel>
          <MetricValue>{current_metrics.revenue_formatted}</MetricValue>
          <MetricSubtitle>
            {financial_breakdown && `Neto: ${financial_breakdown.net_revenue_formatted}`}
          </MetricSubtitle>
          {trends && (
            <MetricTrend positive={trends.revenue_trend === 'increasing'} negative={trends.revenue_trend === 'decreasing'}>
              {trends.revenue_display.icon} {trends.revenue_display.text} ({trends.revenue_change_percentage}%)
            </MetricTrend>
          )}
        </MetricCard>

        <MetricCard>
          <MetricLabel>Estado del Juego</MetricLabel>
          <MetricValue style={{ fontSize: '16px' }}>
            <StatusBadge status={current_metrics.game_status}>
              {current_metrics.game_status_text}
            </StatusBadge>
          </MetricValue>
          {current_metrics.game_time_seconds && (
            <MetricSubtitle>
              Tiempo: {current_metrics.game_duration_formatted}
            </MetricSubtitle>
          )}
          {current_metrics.game_started_at && (
            <MetricTrend>
              Iniciado: {new Date(current_metrics.game_started_at).toLocaleTimeString()}
            </MetricTrend>
          )}
        </MetricCard>
      </MetricsGrid>

      {/* Requisitos */}
      {requirements_status && (
        <ProgressSection>
          <ProgressTitle>📋 Requisitos para Iniciar Partida</ProgressTitle>
          
          <ProgressItem>
            <ProgressHeader>
              <ProgressLabel>Cartones Mínimos</ProgressLabel>
              <ProgressValues>
                {requirements_status.current_cards} / {requirements_status.minimum_cards}
              </ProgressValues>
            </ProgressHeader>
            <ProgressBar>
              <ProgressFill 
                percentage={requirements_status.percentage_complete}
                style={{ width: `${Math.min(requirements_status.percentage_complete, 100)}%` }}
              />
            </ProgressBar>
          </ProgressItem>

          {requirements_status.missing_requirements.length > 0 && (
            <div style={{ marginTop: '12px', fontSize: '12px', color: '#dc3545' }}>
              <strong>Requisitos faltantes:</strong>
              <ul style={{ margin: '4px 0 0 16px' }}>
                {requirements_status.missing_requirements.map((req, index) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
            </div>
          )}

          <div style={{ 
            marginTop: '12px', 
            textAlign: 'center', 
            fontSize: '12px',
            color: requirements_status.can_start_game ? '#28a745' : '#dc3545',
            fontWeight: '600'
          }}>
            {requirements_status.can_start_game ? '✅ Puede iniciar partida' : '❌ No puede iniciar partida'}
          </div>
        </ProgressSection>
      )}

      {/* Desglose Financiero */}
      {financial_breakdown && (
        <ProgressSection>
          <ProgressTitle>💰 Desglose Financiero</ProgressTitle>
          <FinancialGrid>
            <FinancialItem>
              <FinancialLabel>Recaudación Bruta</FinancialLabel>
              <FinancialValue>{financial_breakdown.gross_revenue_formatted}</FinancialValue>
            </FinancialItem>
            <FinancialItem>
              <FinancialLabel>Comisión ({financial_breakdown.commission_percentage}%)</FinancialLabel>
              <FinancialValue>{financial_breakdown.commission_formatted}</FinancialValue>
            </FinancialItem>
            <FinancialItem>
              <FinancialLabel>Premios ({financial_breakdown.prizes_percentage}%)</FinancialLabel>
              <FinancialValue>{financial_breakdown.prizes_formatted}</FinancialValue>
            </FinancialItem>
            <FinancialItem>
              <FinancialLabel>Pozo Especial ({financial_breakdown.special_pot_percentage}%)</FinancialLabel>
              <FinancialValue>{financial_breakdown.special_pot_formatted}</FinancialValue>
            </FinancialItem>
            {financial_breakdown.taxes_formatted && financial_breakdown.taxes_formatted.map((tax, index) => (
              <FinancialItem key={index}>
                <FinancialLabel>{tax.name} ({tax.percentage}%)</FinancialLabel>
                <FinancialValue>{tax.amount_formatted}</FinancialValue>
              </FinancialItem>
            ))}
            <FinancialItem style={{ background: '#e8f5e8', border: '1px solid #c3e6c3' }}>
              <FinancialLabel>Recaudación Neta</FinancialLabel>
              <FinancialValue style={{ color: '#155724' }}>
                {financial_breakdown.net_revenue_formatted}
              </FinancialValue>
            </FinancialItem>
          </FinancialGrid>
        </ProgressSection>
      )}

      {/* Estadísticas Diarias */}
      {daily_stats && (
        <ProgressSection>
          <ProgressTitle>📈 Estadísticas del Día</ProgressTitle>
          <FinancialGrid>
            <FinancialItem>
              <FinancialLabel>Partidas Completadas</FinancialLabel>
              <FinancialValue>{daily_stats.completed_games}</FinancialValue>
            </FinancialItem>
            <FinancialItem>
              <FinancialLabel>Recaudación Total</FinancialLabel>
              <FinancialValue>{daily_stats.total_revenue_formatted}</FinancialValue>
            </FinancialItem>
            <FinancialItem>
              <FinancialLabel>Cartones Vendidos</FinancialLabel>
              <FinancialValue>{formatNumber(daily_stats.total_cards_sold)}</FinancialValue>
            </FinancialItem>
            <FinancialItem>
              <FinancialLabel>Promedio Jugadores</FinancialLabel>
              <FinancialValue>{daily_stats.average_players_per_game}</FinancialValue>
            </FinancialItem>
            <FinancialItem>
              <FinancialLabel>Duración Promedio</FinancialLabel>
              <FinancialValue>{daily_stats.average_game_duration_minutes}m</FinancialValue>
            </FinancialItem>
            {daily_stats.peak_concurrent_users > 0 && (
              <FinancialItem>
                <FinancialLabel>Pico de Usuarios</FinancialLabel>
                <FinancialValue>{daily_stats.peak_concurrent_users}</FinancialValue>
              </FinancialItem>
            )}
          </FinancialGrid>
        </ProgressSection>
      )}
    </StatsContainer>
  );
};

export default RoomStatsPanel;