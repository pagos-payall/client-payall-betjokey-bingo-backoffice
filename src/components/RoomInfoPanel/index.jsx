import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  PanelContainer,
  StatusCard,
  StatusHeader,
  StatusBadge,
  GameStatus,
  DeactivationAlert,
  AlertIcon,
  MetricsGrid,
  MetricCard,
  MetricLabel,
  MetricValue,
  MetricSubtitle,
  MetricTrend,
  RequirementsSection,
  SectionTitle,
  ProgressBarContainer,
  ProgressInfo,
  ProgressLabel,
  ProgressValues,
  ProgressBar,
  ProgressFill,
  ConfigSection,
  ConfigGrid,
  ConfigItem,
  ConfigLabel,
  ConfigValue,
  StatsDashboard,
  StatsGrid,
  StatItem,
  StatValue,
  StatLabel
} from './styles';
import { formatCurrency, formatNumber } from '@/services/utilFunctions';

const RoomInfoPanel = ({ room, initialValues, onEditClick }) => {
  const [metrics, setMetrics] = useState({
    connectedUsers: 0,
    soldCards: 0,
    revenue: 0,
    gameTime: null,
    gameStatus: null
  });

  const [dailyStats, setDailyStats] = useState({
    completedGames: 0,
    totalRevenue: 0,
    averagePlayers: 0
  });

  // Actualizar automáticamente el tiempo de juego
  useEffect(() => {
    let interval;
    if (room.game?.status === 'in_progress' && room.game?.startedAt) {
      interval = setInterval(() => {
        setMetrics(prev => ({
          ...prev,
          gameTime: calculateGameTime(room.game.startedAt)
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [room.game]);

  // Estado mapeado según el plan
  const getStatusMapping = (status) => {
    const statusMap = {
      'off': { label: 'DISPONIBLE', color: 'secondary' },
      'waiting': { label: 'EN_VENTA', color: 'warning' },
      'active': { label: 'PARTIDA_ACTIVA', color: 'success' },
      'delete': { label: 'FINALIZADA', color: 'dark' },
      'archive': { label: 'ARCHIVADA', color: 'info' },
      'disable': { label: 'DESACTIVADA', color: 'danger' }
    };
    return statusMap[status] || { label: status.toUpperCase(), color: 'secondary' };
  };

  const statusInfo = getStatusMapping(room.status);

  // Calcular métricas
  useEffect(() => {
    if (room) {
      const connectedUsers = room.users?.length || 0;
      const totalCards = parseInt(initialValues?.typeOfGame?.split(' ')[1]) || 12000;
      const cardPrice = parseFloat(initialValues?.card_price) || 0;
      
      // Calcular cartones vendidos basado en los disponibles
      const availableCards = room.cards?.availableCards || totalCards;
      const soldCards = totalCards - availableCards;
      const revenue = soldCards * cardPrice;

      setMetrics(prev => ({
        ...prev,
        connectedUsers,
        soldCards,
        totalCards,
        revenue,
        gameStatus: room.game?.status || null
      }));

      // Simular estadísticas del día (en producción vendría de la API)
      // TODO: Conectar con endpoint real de estadísticas cuando esté disponible
      setDailyStats({
        completedGames: 12,
        totalRevenue: 125430,
        averagePlayers: 85
      });
    }
  }, [room, initialValues]);

  const calculateGameTime = (startedAt) => {
    const start = new Date(startedAt);
    const now = new Date();
    const diff = Math.floor((now - start) / 1000);
    const minutes = Math.floor(diff / 60);
    const seconds = diff % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const calculatePercentage = (current, total) => {
    if (!total) return 0;
    return ((current / total) * 100).toFixed(1);
  };

  const getProgressBarColor = (percentage) => {
    if (percentage >= 100) return 'success';
    if (percentage >= 50) return 'warning';
    return 'danger';
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Formatear impuestos
  const formatTaxes = (taxes) => {
    if (!taxes || taxes.length === 0) return 'Sin impuestos';
    return taxes.map(tax => `${tax.name}: ${tax.value}%`).join(', ');
  };

  return (
    <PanelContainer>
      {/* Card de Estado Principal */}
      <StatusCard status={statusInfo.color}>
        <StatusHeader>
          <div>
            <StatusBadge status={statusInfo.color}>
              <span className="status-icon"></span>
              {statusInfo.label}
            </StatusBadge>
          </div>
          {room.game && (
            <GameStatus>
              <span>🎮 {room.game.status === 'in_progress' ? 'Juego en progreso' : 'Juego esperando'}</span>
              <span style={{ color: '#999' }}>ID: {room.game.game_id}</span>
            </GameStatus>
          )}
        </StatusHeader>
      </StatusCard>

      {/* Alerta de desactivación pendiente */}
      {room.scheduled_deactivation?.enabled && (
        <DeactivationAlert>
          <AlertIcon>⏰</AlertIcon>
          <div>
            <strong>Desactivación programada</strong>
            <div style={{ fontSize: '12px', marginTop: '4px' }}>
              {room.scheduled_deactivation.immediate_deactivation 
                ? 'La sala se desactivará inmediatamente'
                : 'La sala se desactivará automáticamente después del juego actual'}
              <br />
              Motivo: {room.scheduled_deactivation.reason || 'No especificado'} - 
              Solicitado por {room.scheduled_deactivation.requested_by || 'Sistema'}
            </div>
          </div>
        </DeactivationAlert>
      )}

      {/* Grid de Métricas */}
      <MetricsGrid>
        <MetricCard>
          <MetricLabel>Usuarios Conectados</MetricLabel>
          <MetricValue>{formatNumber(metrics.connectedUsers)}</MetricValue>
          <MetricSubtitle>de {formatNumber(500)} máximo</MetricSubtitle>
          <MetricTrend positive={true}>
            {metrics.connectedUsers > 0 ? '🟢 En línea' : '⚫ Sin usuarios'}
          </MetricTrend>
        </MetricCard>

        <MetricCard>
          <MetricLabel>Cartones Vendidos</MetricLabel>
          <MetricValue>{formatNumber(metrics.soldCards)}</MetricValue>
          <MetricSubtitle>de {formatNumber(metrics.totalCards)} disponibles</MetricSubtitle>
          <MetricTrend>
            {calculatePercentage(metrics.soldCards, metrics.totalCards)}% vendidos
          </MetricTrend>
        </MetricCard>

        <MetricCard>
          <MetricLabel>Recaudación Actual</MetricLabel>
          <MetricValue>{formatCurrency(metrics.revenue)}</MetricValue>
          <MetricSubtitle>Precio: {formatCurrency(initialValues?.card_price || 0)} por cartón</MetricSubtitle>
          <MetricTrend positive={metrics.revenue > 0}>
            {metrics.revenue > 0 ? '↑ Activo' : '- Sin ventas'}
          </MetricTrend>
        </MetricCard>

        <MetricCard>
          <MetricLabel>Estado del Juego</MetricLabel>
          <MetricValue style={{ fontSize: '20px' }}>
            {metrics.gameStatus || 'Sin juego'}
          </MetricValue>
          {metrics.gameTime && (
            <MetricSubtitle>Tiempo: {metrics.gameTime}</MetricSubtitle>
          )}
          <MetricTrend>
            {room.game ? `Juego #${room.game.game_number || 1}` : 'Esperando inicio'}
          </MetricTrend>
        </MetricCard>
      </MetricsGrid>

      {/* Sección de Requisitos Mínimos */}
      <RequirementsSection>
        <SectionTitle>📊 Requisitos Mínimos para Iniciar Partida</SectionTitle>
        
        <ProgressBarContainer>
          <ProgressInfo>
            <ProgressLabel>Jugadores mínimos</ProgressLabel>
            <ProgressValues>
              {metrics.connectedUsers} / {room.game?.min_players || 2}
            </ProgressValues>
          </ProgressInfo>
          <ProgressBar>
            <ProgressFill 
              status={getProgressBarColor(calculatePercentage(metrics.connectedUsers, room.game?.min_players || 2))}
              style={{ width: `${Math.min(calculatePercentage(metrics.connectedUsers, room.game?.min_players || 2), 100)}%` }}
            />
          </ProgressBar>
        </ProgressBarContainer>

        <ProgressBarContainer>
          <ProgressInfo>
            <ProgressLabel>Valor mínimo de venta</ProgressLabel>
            <ProgressValues>
              {formatCurrency(metrics.revenue)} / {formatCurrency(parseFloat(initialValues?.min_value) * parseFloat(initialValues?.card_price || 1))}
            </ProgressValues>
          </ProgressInfo>
          <ProgressBar>
            <ProgressFill 
              status={getProgressBarColor(calculatePercentage(metrics.revenue, parseFloat(initialValues?.min_value) * parseFloat(initialValues?.card_price || 1) || 1))}
              style={{ width: `${Math.min(calculatePercentage(metrics.revenue, parseFloat(initialValues?.min_value) * parseFloat(initialValues?.card_price || 1) || 1), 100)}%` }}
            />
          </ProgressBar>
        </ProgressBarContainer>
      </RequirementsSection>

      {/* Configuración de la Sala */}
      <ConfigSection>
        <SectionTitle>⚙️ Configuración de la Sala</SectionTitle>
        <ConfigGrid>
          <ConfigItem>
            <ConfigLabel>Tipo de Juego</ConfigLabel>
            <ConfigValue>{initialValues?.typeOfGame || '-'}</ConfigValue>
          </ConfigItem>
          <ConfigItem>
            <ConfigLabel>Tipo de Jugada</ConfigLabel>
            <ConfigValue>{initialValues?.play || '-'}</ConfigValue>
          </ConfigItem>
          <ConfigItem>
            <ConfigLabel>Administrador</ConfigLabel>
            <ConfigValue>{initialValues?.host_username || '-'}</ConfigValue>
          </ConfigItem>
          <ConfigItem>
            <ConfigLabel>Creada</ConfigLabel>
            <ConfigValue>{formatDate(room.createAt)}</ConfigValue>
          </ConfigItem>
          <ConfigItem>
            <ConfigLabel>Comisión</ConfigLabel>
            <ConfigValue>{initialValues?.comision || 0}%</ConfigValue>
          </ConfigItem>
          <ConfigItem>
            <ConfigLabel>Premios</ConfigLabel>
            <ConfigValue>{initialValues?.premios || 0}%</ConfigValue>
          </ConfigItem>
          <ConfigItem>
            <ConfigLabel>Premios Especiales</ConfigLabel>
            <ConfigValue>{initialValues?.pote_especial || 0}%</ConfigValue>
          </ConfigItem>
          <ConfigItem>
            <ConfigLabel>Impuestos</ConfigLabel>
            <ConfigValue>{formatTaxes(initialValues?.taxes)}</ConfigValue>
          </ConfigItem>
          <ConfigItem>
            <ConfigLabel>Distribución Cartón</ConfigLabel>
            <ConfigValue>{initialValues?.porcen_premio_asignado_carton || 0}%</ConfigValue>
          </ConfigItem>
          <ConfigItem>
            <ConfigLabel>Distribución Línea</ConfigLabel>
            <ConfigValue>{initialValues?.porcen_premio_asignado_linea || 0}%</ConfigValue>
          </ConfigItem>
        </ConfigGrid>
      </ConfigSection>

      {/* Mini Dashboard de Estadísticas */}
      <StatsDashboard>
        <SectionTitle>📈 Estadísticas del Día</SectionTitle>
        <StatsGrid>
          <StatItem>
            <StatValue>{dailyStats.completedGames}</StatValue>
            <StatLabel>Partidas Completadas</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>{formatCurrency(dailyStats.totalRevenue)}</StatValue>
            <StatLabel>Recaudación Total</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>{dailyStats.averagePlayers}</StatValue>
            <StatLabel>Promedio Jugadores</StatLabel>
          </StatItem>
        </StatsGrid>
      </StatsDashboard>
    </PanelContainer>
  );
};

export default RoomInfoPanel;