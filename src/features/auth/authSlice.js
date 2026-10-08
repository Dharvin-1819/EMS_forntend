import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { MOCK_USERS } from '../../data/mockData';
import api from '../../services/api';

const getInitialUser = () => {
  const saved = localStorage.getItem('ems_user');
  if (!saved || saved === 'undefined' || saved === 'null') return null;
  try {
    const user = typeof saved === 'string' ? JSON.parse(saved) : saved;
    if (user && typeof user === 'object') {
      if (!user.name || user.name.includes('@')) {
        const handle = (user.name || user.email || '').split('@')[0];
        user.name = handle ? handle.charAt(0).toUpperCase() + handle.slice(1) : 'User';
        localStorage.setItem('ems_user', JSON.stringify(user));
      }
      return user;
    }
    return null;
  } catch (e) {
    return null;
  }
};

const savedUser = getInitialUser();

const getInitialUsers = () => {
  const raw = localStorage.getItem('ems_all_users');
  if (!raw || raw === 'undefined' || raw === 'null') return MOCK_USERS;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : MOCK_USERS;
  } catch (e) {
    return MOCK_USERS;
  }
};

const savedUsers = getInitialUsers();

export const fetchUsersAsync = createAsyncThunk('auth/fetchUsers', async (_, { rejectWithValue }) => {
  try {
    return await api.get('/users');
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const loginAsync = createAsyncThunk('auth/loginAsync', async (credentials, { dispatch, rejectWithValue }) => {
  try {
    const data = await api.post('/auth/login', credentials);
    const role = (data.roles && data.roles[0]) ? data.roles[0].replace('ROLE_', '').toLowerCase() : 'user';
    let cleanName = data.name;
    if (!cleanName || cleanName.includes('@')) {
      const raw = (data.name || data.email || credentials.email || 'User').split('@')[0];
      cleanName = raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : 'User';
    } else {
      cleanName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
    }
    const user = {
      id: data.id,
      name: cleanName,
      email: data.email || credentials.email,
      role: role,
      status: 'approved',
      token: data.token,
    };
    return user;
  } catch (err) {
    // Fallback to local login if backend fails or is not running
    dispatch(login(credentials));
    return rejectWithValue(err.message);
  }
});

export const registerAsync = createAsyncThunk('auth/registerAsync', async (userData, { dispatch, rejectWithValue }) => {
  try {
    const data = await api.post('/auth/register', userData);
    dispatch(register({ ...userData, id: data.id || userData.id }));
    return data;
  } catch (err) {
    dispatch(register(userData));
    return rejectWithValue(err.message);
  }
});

const initialState = {
  currentUser: savedUser,
  allUsers: savedUsers,
  isAuthenticated: !!savedUser,
  authError: null,
  registrationPending: false, // true after a new user registers (awaiting admin approval)
  loading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action) => {
      const { email, password } = action.payload;
      const user = state.allUsers.find(u => u.email === email && u.password === password);
      if (!user) {
        state.authError = 'Invalid email or password. Please try again.';
        return;
      }
      // Admin accounts are always allowed in
      if (user.role !== 'admin') {
        if (user.status === 'pending') {
          state.authError = 'Your account is awaiting admin approval. Please wait for access.';
          return;
        }
        if (user.status === 'rejected') {
          state.authError = 'Your account access was denied. Please contact the administrator.';
          return;
        }
      }
      state.currentUser = user;
      state.isAuthenticated = true;
      state.authError = null;
      state.registrationPending = false;
      localStorage.setItem('ems_user', JSON.stringify(user));
    },

    logout: (state) => {
      state.currentUser = null;
      state.isAuthenticated = false;
      state.authError = null;
      state.registrationPending = false;
      localStorage.removeItem('ems_user');
    },

    register: (state, action) => {
      const { name, email, password, phone, role = 'user', id, status = 'pending' } = action.payload;
      const exists = state.allUsers.find(u => u.email === email);
      if (exists) {
        state.authError = 'An account with this email already exists.';
        return;
      }
      const newUser = {
        id: id || `u${Date.now()}`,
        name,
        email,
        password,
        phone,
        role,
        status,
        avatar: null,
        joinedAt: new Date().toISOString().split('T')[0],
        notifications: [],
      };
      state.allUsers.push(newUser);
      // Do NOT log the user in — they must wait for admin approval
      state.registrationPending = true;
      state.authError = null;
      localStorage.setItem('ems_all_users', JSON.stringify(state.allUsers));
    },

    clearAuthError: (state) => {
      state.authError = null;
    },

    clearRegistrationPending: (state) => {
      state.registrationPending = false;
    },

    // Admin approves a user
    approveUser: (state, action) => {
      const idx = state.allUsers.findIndex(u => u.id === action.payload);
      if (idx !== -1) {
        state.allUsers[idx].status = 'approved';
        localStorage.setItem('ems_all_users', JSON.stringify(state.allUsers));
      }
      api.patch(`/users/${action.payload}`, { status: 'approved' }).catch(() => {});
    },

    // Admin rejects a user
    rejectUser: (state, action) => {
      const idx = state.allUsers.findIndex(u => u.id === action.payload);
      if (idx !== -1) {
        state.allUsers[idx].status = 'rejected';
        localStorage.setItem('ems_all_users', JSON.stringify(state.allUsers));
      }
      api.patch(`/users/${action.payload}`, { status: 'rejected' }).catch(() => {});
    },

    updateUserProfile: (state, action) => {
      const idx = state.allUsers.findIndex(u => u.id === state.currentUser.id);
      if (idx !== -1) {
        state.allUsers[idx] = { ...state.allUsers[idx], ...action.payload };
        state.currentUser = { ...state.currentUser, ...action.payload };
        localStorage.setItem('ems_user', JSON.stringify(state.currentUser));
        localStorage.setItem('ems_all_users', JSON.stringify(state.allUsers));
      }
      api.put(`/users/${state.currentUser.id}`, action.payload).catch(() => {});
    },

    deleteUser: (state, action) => {
      state.allUsers = state.allUsers.filter(u => u.id !== action.payload);
      localStorage.setItem('ems_all_users', JSON.stringify(state.allUsers));
      api.delete(`/users/${action.payload}`).catch(() => {});
    },

    // Admin changes role of any user
    changeUserRole: (state, action) => {
      const { id, role } = action.payload;
      const idx = state.allUsers.findIndex(u => u.id === id);
      if (idx !== -1) {
        state.allUsers[idx].role = role;
        if (state.currentUser && state.currentUser.id === id) {
          state.currentUser.role = role;
          localStorage.setItem('ems_user', JSON.stringify(state.currentUser));
        }
        localStorage.setItem('ems_all_users', JSON.stringify(state.allUsers));
      }
      api.patch(`/users/${id}`, { role }).catch(() => {});
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsersAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUsersAsync.fulfilled, (state, action) => {
        state.loading = false;
        if (Array.isArray(action.payload) && action.payload.length > 0) {
          state.allUsers = action.payload;
          localStorage.setItem('ems_all_users', JSON.stringify(action.payload));
          if (state.currentUser) {
            const found = action.payload.find(u => 
              String(u.id) === String(state.currentUser.id) ||
              u.email?.toLowerCase() === state.currentUser.email?.toLowerCase()
            );
            if (found && found.name) {
              let clean = found.name;
              if (clean.includes('@')) {
                clean = clean.split('@')[0];
              }
              clean = clean.charAt(0).toUpperCase() + clean.slice(1);
              if (state.currentUser.name !== clean) {
                state.currentUser.name = clean;
                localStorage.setItem('ems_user', JSON.stringify(state.currentUser));
              }
            }
          }
        }
      })
      .addCase(fetchUsersAsync.rejected, (state) => {
        state.loading = false;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        if (action.payload) {
          state.currentUser = action.payload;
          state.isAuthenticated = true;
          state.authError = null;
          localStorage.setItem('ems_user', JSON.stringify(action.payload));
        }
      });
  },
});

export const {
  login,
  logout,
  register,
  clearAuthError,
  clearRegistrationPending,
  approveUser,
  rejectUser,
  updateUserProfile,
  deleteUser,
  changeUserRole,
} = authSlice.actions;
export default authSlice.reducer;
