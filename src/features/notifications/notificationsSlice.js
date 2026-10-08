import { createSlice } from '@reduxjs/toolkit';
import { MOCK_NOTIFICATIONS } from '../../data/mockData';

const savedNotifs = localStorage.getItem('ems_notifications');

const initialState = {
  notifications: savedNotifs ? JSON.parse(savedNotifs) : MOCK_NOTIFICATIONS,
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action) => {
      const notif = {
        id: `notif${Date.now()}`,
        createdAt: new Date().toISOString(),
        read: false,
        ...action.payload,
      };
      state.notifications.unshift(notif);
      localStorage.setItem('ems_notifications', JSON.stringify(state.notifications));
    },
    markAsRead: (state, action) => {
      const notif = state.notifications.find(n => n.id === action.payload);
      if (notif) {
        notif.read = true;
        localStorage.setItem('ems_notifications', JSON.stringify(state.notifications));
      }
    },
    markAllAsRead: (state, action) => {
      state.notifications.forEach(n => {
        if (n.userId === action.payload || String(n.userId) === String(action.payload) || (action.payload === 3 && n.userId === 'u3') || n.userId === 'all') {
          n.read = true;
        }
      });
      localStorage.setItem('ems_notifications', JSON.stringify(state.notifications));
    },
    deleteNotification: (state, action) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
      localStorage.setItem('ems_notifications', JSON.stringify(state.notifications));
    },
    sendGlobalNotification: (state, action) => {
      // Adds a notification for all users (or specific roles)
      const notif = {
        id: `notif${Date.now()}`,
        createdAt: new Date().toISOString(),
        read: false,
        userId: 'all',
        ...action.payload,
      };
      state.notifications.unshift(notif);
      localStorage.setItem('ems_notifications', JSON.stringify(state.notifications));
    },
  },
});

export const { addNotification, markAsRead, markAllAsRead, deleteNotification, sendGlobalNotification } = notificationsSlice.actions;
export default notificationsSlice.reducer;
