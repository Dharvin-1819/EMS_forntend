import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { MOCK_TICKETS } from '../../data/mockData';
import api from '../../services/api';
import { decrementRegistered } from '../events/eventsSlice';

const savedTickets = localStorage.getItem('ems_tickets');

export const fetchTicketsAsync = createAsyncThunk('tickets/fetchTickets', async (_, { rejectWithValue }) => {
  try {
    return await api.get('/tickets');
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const createTicketAsync = createAsyncThunk('tickets/createTicket', async (ticketData, { dispatch, rejectWithValue }) => {
  try {
    const data = await api.post('/tickets', ticketData);
    const completeTicket = {
      ...ticketData,
      ...data,
      eventTitle: data?.event?.title || ticketData.eventTitle,
      venue: data?.event?.venue || ticketData.venue,
      eventDate: data?.event?.date || ticketData.eventDate,
      eventCategory: data?.event?.category || ticketData.eventCategory,
      eventTime: data?.event?.time || ticketData.eventTime,
      ticketType: data?.ticketType?.name || ticketData.ticketType || 'General',
      userName: data?.user?.name || ticketData.userName,
      eventId: data?.event?.id || ticketData.eventId,
      userId: data?.user?.id || ticketData.userId,
    };
    dispatch(addTicket(completeTicket));
    return completeTicket;
  } catch (err) {
    const fallbackTicket = {
      id: `tk${Date.now()}`,
      ticketNumber: `EVP-${new Date().getFullYear()}-TK${Date.now() % 10000}`,
      purchasedAt: new Date().toISOString().split('T')[0],
      status: 'active',
      qrCode: `QR-EVP-${Date.now()}`,
      ...ticketData,
    };
    dispatch(addTicket(fallbackTicket));
    return fallbackTicket;
  }
});

export const cancelTicketAsync = createAsyncThunk('tickets/cancelTicket', async (payload, { dispatch, rejectWithValue }) => {
  const ticketId = typeof payload === 'object' ? payload.ticketId : payload;
  const refundAmount = typeof payload === 'object' ? payload.refundAmount : undefined;
  const eventId = typeof payload === 'object' ? payload.eventId : undefined;
  const seats = typeof payload === 'object' ? payload.seats : 1;
  const refundMethod = typeof payload === 'object' ? payload.refundMethod : 'Original Payment Method';

  try {
    const data = await api.post(`/tickets/${ticketId}/cancel`, {}).catch(() =>
      api.patch(`/tickets/${ticketId}`, {
        status: 'cancelled',
        refundStatus: 'Refunded',
        refundAmount: refundAmount || 0,
      })
    );
    dispatch(cancelTicket({ ticketId, refundAmount, refundMethod }));
    if (eventId) {
      dispatch(decrementRegistered({ eventId, seats: seats || 1 }));
    }
    return data;
  } catch (err) {
    dispatch(cancelTicket({ ticketId, refundAmount, refundMethod }));
    if (eventId) {
      dispatch(decrementRegistered({ eventId, seats: seats || 1 }));
    }
    return rejectWithValue(err.message);
  }
});

const initialState = {
  tickets: savedTickets ? JSON.parse(savedTickets) : MOCK_TICKETS,
  loading: false,
  error: null,
};

const ticketsSlice = createSlice({
  name: 'tickets',
  initialState,
  reducers: {
    addTicket: (state, action) => {
      const p = action.payload;
      const newTicket = {
        id: p.id || `tk${Date.now()}`,
        ticketNumber: p.ticketNumber || `EVP-${new Date().getFullYear()}-TK${String(state.tickets.length + 1).padStart(3, '0')}`,
        purchasedAt: p.purchasedAt || new Date().toISOString().split('T')[0],
        status: p.status || 'active',
        qrCode: p.qrCode || `QR-EVP-${Date.now()}`,
        ...p,
        eventTitle: p.event?.title || p.eventTitle || 'Featured Event',
        venue: p.event?.venue || p.venue || 'TBA',
        eventDate: p.event?.date || p.eventDate,
        eventCategory: p.event?.category || p.eventCategory,
        eventTime: p.event?.time || p.eventTime || '10:00 AM',
        ticketType: typeof p.ticketType === 'object' ? (p.ticketType?.name || 'General') : (p.ticketType || 'General'),
        userName: p.user?.name || p.userName || 'Attendee',
        userId: p.user?.id || p.userId,
        eventId: p.event?.id || p.eventId,
      };
      state.tickets.push(newTicket);
      localStorage.setItem('ems_tickets', JSON.stringify(state.tickets));
    },
    cancelTicket: (state, action) => {
      const ticketId = typeof action.payload === 'object' ? action.payload.ticketId : action.payload;
      const refundAmount = typeof action.payload === 'object' ? action.payload.refundAmount : undefined;
      const refundMethod = typeof action.payload === 'object' && action.payload.refundMethod ? action.payload.refundMethod : 'Original Payment Method (UPI / Bank)';

      const idx = state.tickets.findIndex(t => String(t.id) === String(ticketId));
      if (idx !== -1) {
        const ticket = state.tickets[idx];
        const finalRefund = refundAmount !== undefined ? refundAmount : (ticket.price || 0);
        ticket.status = 'cancelled';
        ticket.refundStatus = 'Refunded';
        ticket.refundAmount = finalRefund;
        ticket.refundedAt = new Date().toISOString();
        ticket.refundMethod = refundMethod;
        ticket.refundTxnId = ticket.refundTxnId || `REF-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
        localStorage.setItem('ems_tickets', JSON.stringify(state.tickets));

        api.patch(`/tickets/${ticketId}`, {
          status: 'cancelled',
          refundStatus: 'Refunded',
          refundAmount: finalRefund,
          refundMethod,
        }).catch(() => {});
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTicketsAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTicketsAsync.fulfilled, (state, action) => {
        state.loading = false;
        if (Array.isArray(action.payload) && action.payload.length > 0) {
          state.tickets = action.payload.map(t => ({
            ...t,
            eventTitle: t.event?.title || t.eventTitle || 'Featured Event',
            venue: t.event?.venue || t.venue || 'TBA',
            eventDate: t.event?.date || t.eventDate,
            eventCategory: t.event?.category || t.eventCategory,
            eventTime: t.event?.time || t.eventTime || '10:00 AM',
            ticketType: typeof t.ticketType === 'object' ? (t.ticketType?.name || 'General') : (t.ticketType || 'General'),
            userName: t.user?.name || t.userName || 'Attendee',
            userId: t.user?.id || t.userId,
            eventId: t.event?.id || t.eventId,
          }));
          localStorage.setItem('ems_tickets', JSON.stringify(state.tickets));
        }
      })
      .addCase(fetchTicketsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { addTicket, cancelTicket } = ticketsSlice.actions;
export default ticketsSlice.reducer;
