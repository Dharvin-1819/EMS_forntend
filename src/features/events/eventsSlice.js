import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { MOCK_EVENTS } from '../../data/mockData';
import api from '../../services/api';

const savedEvents = localStorage.getItem('ems_events');

export const fetchEventsAsync = createAsyncThunk('events/fetchEvents', async (_, { rejectWithValue }) => {
  try {
    return await api.get('/events');
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const createEventAsync = createAsyncThunk('events/createEvent', async (eventData, { dispatch, rejectWithValue }) => {
  try {
    const data = await api.post('/events', eventData);
    dispatch(addEvent(data));
    return data;
  } catch (err) {
    dispatch(addEvent(eventData));
    return rejectWithValue(err.message);
  }
});

export const updateEventAsync = createAsyncThunk('events/updateEvent', async (eventData, { dispatch, rejectWithValue }) => {
  try {
    const data = await api.put(`/events/${eventData.id}`, eventData);
    dispatch(updateEvent(data));
    return data;
  } catch (err) {
    dispatch(updateEvent(eventData));
    return rejectWithValue(err.message);
  }
});

export const deleteEventAsync = createAsyncThunk('events/deleteEvent', async (eventId, { dispatch, rejectWithValue }) => {
  try {
    await api.delete(`/events/${eventId}`);
    dispatch(deleteEvent(eventId));
    return eventId;
  } catch (err) {
    dispatch(deleteEvent(eventId));
    return rejectWithValue(err.message);
  }
});

const normalizeEvent = (e) => ({
  ...e,
  organizerId: e.organizerId || e.organizer?.id,
  organizerName: e.organizerName || e.organizer?.name,
});

const initialState = {
  events: savedEvents ? JSON.parse(savedEvents).map(normalizeEvent) : MOCK_EVENTS,
  loading: false,
  error: null,
  selectedEvent: null,
};

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    addEvent: (state, action) => {
      const payload = normalizeEvent(action.payload);
      const newEvent = {
        registered: 0,
        rating: 0,
        reviews: 0,
        isPast: false,
        ...payload,
        id: payload.id || `ev${Date.now()}`,
      };
      const existingIdx = state.events.findIndex(e => String(e.id) === String(newEvent.id));
      if (existingIdx !== -1) {
        state.events[existingIdx] = newEvent;
      } else {
        state.events.push(newEvent);
      }
      localStorage.setItem('ems_events', JSON.stringify(state.events));
    },
    updateEvent: (state, action) => {
      const idx = state.events.findIndex(e => String(e.id) === String(action.payload.id));
      if (idx !== -1) {
        state.events[idx] = { ...state.events[idx], ...action.payload };
        localStorage.setItem('ems_events', JSON.stringify(state.events));
      }
    },
    deleteEvent: (state, action) => {
      state.events = state.events.filter(e => String(e.id) !== String(action.payload));
      localStorage.setItem('ems_events', JSON.stringify(state.events));
    },
    setSelectedEvent: (state, action) => {
      state.selectedEvent = state.events.find(e => String(e.id) === String(action.payload)) || null;
    },
    incrementRegistered: (state, action) => {
      const { eventId, seats } = action.payload;
      const idx = state.events.findIndex(e => String(e.id) === String(eventId));
      if (idx !== -1) {
        state.events[idx].registered += seats;
        localStorage.setItem('ems_events', JSON.stringify(state.events));
        api.patch(`/events/${eventId}`, { registered: state.events[idx].registered }).catch(() => {});
      }
    },
    decrementRegistered: (state, action) => {
      const { eventId, seats = 1 } = action.payload;
      const idx = state.events.findIndex(e => String(e.id) === String(eventId));
      if (idx !== -1) {
        state.events[idx].registered = Math.max(0, (state.events[idx].registered || 0) - seats);
        localStorage.setItem('ems_events', JSON.stringify(state.events));
        api.patch(`/events/${eventId}`, { registered: state.events[idx].registered }).catch(() => {});
      }
    },
    addReview: (state, action) => {
      const { eventId, rating } = action.payload;
      const idx = state.events.findIndex(e => String(e.id) === String(eventId));
      if (idx !== -1) {
        const ev = state.events[idx];
        const newRating = ((ev.rating * ev.reviews) + rating) / (ev.reviews + 1);
        state.events[idx].rating = Math.round(newRating * 10) / 10;
        state.events[idx].reviews += 1;
        localStorage.setItem('ems_events', JSON.stringify(state.events));
        api.patch(`/events/${eventId}`, { rating: state.events[idx].rating, reviews: state.events[idx].reviews }).catch(() => {});
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEventsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEventsAsync.fulfilled, (state, action) => {
        state.loading = false;
        if (Array.isArray(action.payload) && action.payload.length > 0) {
          state.events = action.payload.map(normalizeEvent);
          localStorage.setItem('ems_events', JSON.stringify(state.events));
        }
      })
      .addCase(fetchEventsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { addEvent, updateEvent, deleteEvent, setSelectedEvent, incrementRegistered, decrementRegistered, addReview } = eventsSlice.actions;
export default eventsSlice.reducer;
