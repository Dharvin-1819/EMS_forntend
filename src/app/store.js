import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import eventsReducer from '../features/events/eventsSlice';
import ticketsReducer from '../features/tickets/ticketsSlice';
import notificationsReducer from '../features/notifications/notificationsSlice';
import feedbackReducer from '../features/feedback/feedbackSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    events: eventsReducer,
    tickets: ticketsReducer,
    notifications: notificationsReducer,
    feedback: feedbackReducer,
  },
});

export default store;
