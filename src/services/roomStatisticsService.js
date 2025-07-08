import axios from '@/config/axiosConfig';

/**
 * Room Statistics Service
 * Provides methods to interact with the room statistics API endpoint
 */
class RoomStatisticsService {
  /**
   * Get room statistics
   * @param {string} roomId - Room ID
   * @param {Object} options - Query parameters
   * @param {boolean} options.includeHistory - Include game history
   * @param {string} options.period - Time period for historical data ('today', '7days', '30days')
   * @returns {Promise<Object>} Room statistics data
   */
  async getRoomStatistics(roomId, options = {}) {
    try {
      const { includeHistory = false, period = 'today' } = options;
      
      const response = await axios.get(`/bingo/rooms/${roomId}/statistics`, {
        params: {
          includeHistory,
          period
        }
      });

      
      // Handle different response structures
      const data = response.data.data || response.data.result || response.data;
      
      
      return data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get basic room statistics (without history)
   * @param {string} roomId - Room ID
   * @returns {Promise<Object>} Basic room statistics
   */
  async getBasicStatistics(roomId) {
    return this.getRoomStatistics(roomId, { includeHistory: false });
  }

  /**
   * Get room statistics with history
   * @param {string} roomId - Room ID
   * @param {string} period - Time period ('today', '7days', '30days')
   * @returns {Promise<Object>} Room statistics with history
   */
  async getStatisticsWithHistory(roomId, period = 'today') {
    return this.getRoomStatistics(roomId, { includeHistory: true, period });
  }

  /**
   * Get real-time metrics only
   * @param {string} roomId - Room ID
   * @returns {Promise<Object>} Current metrics
   */
  async getCurrentMetrics(roomId) {
    const stats = await this.getBasicStatistics(roomId);
    return stats.current_metrics;
  }

  /**
   * Get financial breakdown
   * @param {string} roomId - Room ID
   * @returns {Promise<Object>} Financial breakdown
   */
  async getFinancialBreakdown(roomId) {
    const stats = await this.getBasicStatistics(roomId);
    return stats.financial_breakdown;
  }

  /**
   * Get requirements status
   * @param {string} roomId - Room ID
   * @returns {Promise<Object>} Requirements status
   */
  async getRequirementsStatus(roomId) {
    const stats = await this.getBasicStatistics(roomId);
    return stats.requirements_status;
  }

  /**
   * Check if room can start game
   * @param {string} roomId - Room ID
   * @returns {Promise<boolean>} Whether the room can start a game
   */
  async canStartGame(roomId) {
    const requirements = await this.getRequirementsStatus(roomId);
    return requirements.can_start_game;
  }

  /**
   * Get daily statistics
   * @param {string} roomId - Room ID
   * @returns {Promise<Object>} Daily statistics
   */
  async getDailyStats(roomId) {
    const stats = await this.getBasicStatistics(roomId);
    return stats.daily_stats;
  }

  /**
   * Get trends data
   * @param {string} roomId - Room ID
   * @returns {Promise<Object>} Trends data
   */
  async getTrends(roomId) {
    const stats = await this.getBasicStatistics(roomId);
    return stats.trends;
  }

  /**
   * Format currency values
   * @param {number} amount - Amount to format
   * @param {string} currency - Currency code (default: 'COP')
   * @returns {string} Formatted currency string
   */
  formatCurrency(amount, currency = 'COP') {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  /**
   * Format percentage values
   * @param {number} value - Percentage value
   * @returns {string} Formatted percentage string
   */
  formatPercentage(value) {
    return new Intl.NumberFormat('es-CO', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(value / 100);
  }

  /**
   * Get game status display text
   * @param {string|null} gameStatus - Game status from API
   * @returns {string} Human-readable game status
   */
  getGameStatusText(gameStatus) {
    const statusMap = {
      null: 'Sin juego',
      'waiting': 'Esperando jugadores',
      'countdown': 'Iniciando...',
      'in_progress': 'En progreso',
      'finishing': 'Finalizando',
      'finished': 'Terminado'
    };
    return statusMap[gameStatus] || 'Estado desconocido';
  }

  /**
   * Get trend display text and icon
   * @param {string} trend - Trend value ('increasing', 'decreasing', 'stable')
   * @returns {Object} Object with text and icon
   */
  getTrendDisplay(trend) {
    const trendMap = {
      'increasing': { text: 'Creciente', icon: '📈', color: 'green' },
      'decreasing': { text: 'Decreciente', icon: '📉', color: 'red' },
      'stable': { text: 'Estable', icon: '➡️', color: 'gray' }
    };
    return trendMap[trend] || { text: 'Desconocido', icon: '❓', color: 'gray' };
  }

  /**
   * Calculate game duration in human-readable format
   * @param {number} gameTimeSeconds - Game time in seconds
   * @returns {string} Formatted duration
   */
  formatGameDuration(gameTimeSeconds) {
    if (!gameTimeSeconds) return 'N/A';
    
    const hours = Math.floor(gameTimeSeconds / 3600);
    const minutes = Math.floor((gameTimeSeconds % 3600) / 60);
    const seconds = gameTimeSeconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }

  /**
   * Handle API errors consistently
   * @param {Error} error - Original error
   * @returns {Error} Formatted error
   */
  handleError(error) {
    // Log detailed error information

    if (error.response?.data?.error) {
      const apiError = error.response.data.error;
      const formattedError = new Error(apiError.message || 'Error desconocido');
      formattedError.code = apiError.code;
      formattedError.status = error.response.status;
      return formattedError;
    }
    
    // Handle specific status codes
    if (error.response?.status === 404) {
      return new Error('Estadísticas no encontradas para esta sala');
    }
    
    if (error.response?.status === 403) {
      return new Error('No tienes permisos para ver las estadísticas de esta sala');
    }
    
    if (error.response?.status === 500) {
      return new Error('Error del servidor al obtener estadísticas');
    }
    
    return error;
  }
}

export default new RoomStatisticsService();