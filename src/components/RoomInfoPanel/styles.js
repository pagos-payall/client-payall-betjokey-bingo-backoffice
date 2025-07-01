import styled from 'styled-components';
import { theme } from '@/data/themes';

export const PanelContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px;
  background: ${theme.dark.background.secundary};
  border-radius: 10px;
  width: 100%;
  animation: fadeIn 0.3s ease-in;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export const StatusCard = styled.div`
  background: ${theme.dark.background.primary};
  border-radius: 12px;
  padding: 24px;
  position: relative;
  overflow: hidden;
  border: 2px solid ${({ status }) => getStatusColor(status)};
  transition: all 0.3s ease;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: ${({ status }) => getStatusColor(status)};
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px ${({ status }) => getStatusColor(status)}33;
  }
`;

export const StatusHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
`;

export const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  background: ${({ status }) => getStatusColor(status)};
  color: white;
  
  .status-icon {
    width: 8px;
    height: 8px;
    background: white;
    border-radius: 50%;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7);
    }
    70% {
      box-shadow: 0 0 0 10px rgba(255, 255, 255, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
    }
  }
`;

export const GameStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  color: ${theme.dark.colors.green};
  font-size: 14px;
`;

export const DeactivationAlert = styled.div`
  background: #fef3c7;
  border: 1px solid #f59e0b;
  color: #92400e;
  padding: 16px 20px;
  border-radius: 8px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  animation: slideIn 0.3s ease-out;

  @keyframes slideIn {
    from {
      transform: translateX(-20px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;

export const AlertIcon = styled.span`
  color: #f59e0b;
  font-size: 24px;
  line-height: 1;
`;

export const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
`;

export const MetricCard = styled.div`
  background: ${theme.dark.background.primary};
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #333;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    border-color: ${theme.dark.colors.purple};
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.1);
  }
`;

export const MetricLabel = styled.div`
  color: #999;
  font-size: 14px;
  margin-bottom: 8px;
`;

export const MetricValue = styled.div`
  font-size: 32px;
  font-weight: 700;
  color: ${theme.dark.fonts.title_headers};
  margin-bottom: 4px;
  line-height: 1.1;
`;

export const MetricSubtitle = styled.div`
  color: #666;
  font-size: 12px;
`;

export const MetricTrend = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: ${({ positive }) => positive ? theme.dark.colors.green : '#999'};
  font-size: 12px;
  margin-top: 8px;
`;

export const RequirementsSection = styled.div`
  background: ${theme.dark.background.primary};
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #333;
`;

export const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: ${theme.dark.fonts.title_headers};
`;

export const ProgressBarContainer = styled.div`
  margin-bottom: 16px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

export const ProgressInfo = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
`;

export const ProgressLabel = styled.span`
  color: #999;
  font-size: 14px;
`;

export const ProgressValues = styled.span`
  color: ${theme.dark.fonts.title_headers};
  font-size: 14px;
  font-weight: 500;
`;

export const ProgressBar = styled.div`
  background: #333;
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
`;

export const ProgressFill = styled.div`
  background: ${({ status }) => 
    status === 'success' ? theme.dark.colors.green :
    status === 'warning' ? theme.dark.colors.yellow :
    status === 'danger' ? theme.dark.colors.red :
    theme.dark.colors.green};
  height: 100%;
  transition: width 0.5s ease, background-color 0.3s ease;
`;

export const ConfigSection = styled.div`
  background: ${theme.dark.background.primary};
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #333;
`;

export const ConfigGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
`;

export const ConfigItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const ConfigLabel = styled.span`
  color: #999;
  font-size: 12px;
`;

export const ConfigValue = styled.span`
  color: ${theme.dark.fonts.title_headers};
  font-size: 14px;
  font-weight: 500;
`;

export const StatsDashboard = styled.div`
  background: ${theme.dark.background.primary};
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #333;
`;

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-top: 16px;
`;

export const StatItem = styled.div`
  text-align: center;
  padding: 16px;
  background: ${theme.dark.background.secundary};
  border-radius: 8px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    background: #1a1a1a;
  }
`;

export const StatValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: ${theme.dark.colors.purple};
`;

export const StatLabel = styled.div`
  color: #999;
  font-size: 12px;
  margin-top: 4px;
`;

// Función helper para obtener colores según el estado
const getStatusColor = (status) => {
  const colors = {
    success: theme.dark.colors.green,
    warning: theme.dark.colors.yellow,
    danger: theme.dark.colors.red,
    info: theme.dark.colors.lightBlue,
    secondary: '#6c757d',
    dark: '#343a40'
  };
  return colors[status] || colors.secondary;
};