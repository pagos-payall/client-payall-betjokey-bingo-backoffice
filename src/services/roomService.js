/**
 * Room Service - Centralized API calls for room operations
 * Based on ROOMS_API_DOCUMENTATION.md
 */

const ROOM_API_BASE = '/bingo/rooms';

export const roomService = {
	// Basic CRUD operations
	async getRooms() {
		return `${ROOM_API_BASE}`;
	},

	async createRoom(data) {
		return {
			url: `${ROOM_API_BASE}`,
			method: 'post',
			data,
		};
	},

	async updateRoom(roomId, data) {
		return {
			url: `${ROOM_API_BASE}`,
			method: 'patch',
			data: {
				room_id: roomId,
				...data,
			},
		};
	},

	// State operations
	async updateRoomState(roomId, status, reason) {
		return {
			url: `${ROOM_API_BASE}/state`,
			method: 'patch',
			data: {
				roomId,
				status,
				reason,
			},
		};
	},

	// Archive operations
	async archiveRoom(roomId, operatorName, reason) {
		return {
			url: `${ROOM_API_BASE}/${roomId}/archive`,
			method: 'post',
			data: {
				operatorName,
				reason: reason || 'Archivado manual desde backoffice',
			},
		};
	},

	async unarchiveRoom(roomId, operatorName, reason) {
		return {
			url: `${ROOM_API_BASE}/${roomId}/unarchive`,
			method: 'post',
			data: {
				operatorName,
				reason: reason || 'Desarchivado manual desde backoffice',
			},
		};
	},

	// Scheduled deactivation
	async scheduleDeactivation(roomId, requestedBy, options = {}) {
		return {
			url: `${ROOM_API_BASE}/${roomId}/schedule-deactivation`,
			method: 'post',
			data: {
				requestedBy,
				reason: options.reason || 'Desactivación programada desde backoffice',
				scheduledAt: options.scheduledAt || new Date().toISOString(),
				notifyUsers: options.notifyUsers !== false,
				autoExecute: options.autoExecute !== false,
			},
		};
	},

	async cancelScheduledDeactivation(roomId, requestedBy) {
		return {
			url: `${ROOM_API_BASE}/${roomId}/schedule-deactivation`,
			method: 'delete',
			data: {
				requestedBy,
			},
		};
	},

	async getScheduledDeactivations() {
		return {
			url: `${ROOM_API_BASE}/scheduled-deactivations`,
			method: 'get',
		};
	},

	// Room state and operations
	async getRoomState(roomId) {
		return {
			url: `${ROOM_API_BASE}/${roomId}/estado`,
			method: 'get',
		};
	},

	async getAllowedOperations(roomId, operations) {
		const params = operations ? `?operations=${operations.join(',')}` : '';
		return {
			url: `${ROOM_API_BASE}/${roomId}/allowed-operations${params}`,
			method: 'get',
		};
	},

	// Legacy operations (for backward compatibility)
	async deleteRoom(roomId, operatorName, reason) {
		return {
			url: `${ROOM_API_BASE}`,
			method: 'put',
			data: {
				room_id: roomId,
				operation: 'delete',
				operatorName,
				reason: reason || 'Eliminación desde backoffice',
			},
		};
	},

	async legacyOperation(roomId, operation, operatorName, reason) {
		return {
			url: `${ROOM_API_BASE}`,
			method: 'put',
			data: {
				room_id: roomId,
				operation,
				operatorName,
				reason,
			},
		};
	},
};
