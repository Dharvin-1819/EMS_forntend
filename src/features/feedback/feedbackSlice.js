import { createSlice } from '@reduxjs/toolkit';
import { MOCK_FEEDBACKS } from '../../data/mockData';

const savedFeedbacks = localStorage.getItem('ems_feedbacks');

const initialState = {
  feedbacks: savedFeedbacks ? JSON.parse(savedFeedbacks) : MOCK_FEEDBACKS,
};

const feedbackSlice = createSlice({
  name: 'feedback',
  initialState,
  reducers: {
    addFeedback: (state, action) => {
      const newFeedback = {
        id: `fb${Date.now()}`,
        createdAt: new Date().toISOString(),
        type: 'event_review',
        ...action.payload,
      };
      state.feedbacks.push(newFeedback);
      localStorage.setItem('ems_feedbacks', JSON.stringify(state.feedbacks));
    },
    addCancellationFeedback: (state, action) => {
      const newFeedback = {
        id: `fbc_${Date.now()}`,
        createdAt: new Date().toISOString(),
        type: 'cancellation',
        ...action.payload,
      };
      const existingIdx = state.feedbacks.findIndex(
        f => f.ticketId && String(f.ticketId) === String(action.payload.ticketId)
      );
      if (existingIdx !== -1) {
        state.feedbacks[existingIdx] = { ...state.feedbacks[existingIdx], ...newFeedback };
      } else {
        state.feedbacks.push(newFeedback);
      }
      localStorage.setItem('ems_feedbacks', JSON.stringify(state.feedbacks));
    },
  },
});

export const { addFeedback, addCancellationFeedback } = feedbackSlice.actions;
export default feedbackSlice.reducer;
