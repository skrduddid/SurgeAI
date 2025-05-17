import {SERVER_URL} from '@env';
import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';

export interface AuthState {
  provider: 'privy' | null;
  address: string | null;
  isLoggedIn: boolean;
  profilePicUrl: string | null;
  username: string | null; // storing user's chosen display name
  description: string | null; // storing user's bio description
  // attachmentData object to hold any attached profile data (e.g., coin)
  attachmentData?: {
    coin?: {
      mint: string;
      symbol?: string;
      name?: string;
    };
  };
}

const initialState: AuthState = {
  provider: null,
  address: null,
  isLoggedIn: false,
  profilePicUrl: null,
  username: null,
  description: null,
  attachmentData: {},
};

const SERVER_BASE_URL = SERVER_URL || 'http://localhost:3000';

/**
 * Fetch the user's profile from the server, including profile pic URL, username,
 * and attachment data.
 */
export const fetchUserProfile = createAsyncThunk(
  'auth/fetchUserProfile',
  async (userId: string, thunkAPI) => {
    // When we have a server, we would fetch from it
    // For now, just return empty data since we're using Redux storage
    return {
      profilePicUrl: null,
      username: null,
      description: null,
      attachmentData: {},
    };
  },
);

/**
 * Update the user's username in Redux
 */
export const updateUsername = createAsyncThunk(
  'auth/updateUsername',
  async (
    {userId, newUsername}: {userId: string; newUsername: string},
    thunkAPI,
  ) => {
    // Just return the new username since we're storing in Redux
    return newUsername;
  },
);

/**
 * Update the user's description in Redux
 */
export const updateDescription = createAsyncThunk(
  'auth/updateDescription',
  async (
    {userId, newDescription}: {userId: string; newDescription: string},
    thunkAPI,
  ) => {
    // Just return the new description since we're storing in Redux
    return newDescription;
  },
);

/**
 * Attach or update a coin on the user's profile.
 * Now accepts: { userId, attachmentData } where attachmentData = { coin: { mint, symbol, name } }
 */
export const attachCoinToProfile = createAsyncThunk(
  'auth/attachCoinToProfile',
  async (
    {
      userId,
      attachmentData,
    }: {
      userId: string;
      attachmentData: {coin: {mint: string; symbol?: string; name?: string}};
    },
    thunkAPI,
  ) => {
    try {
      const response = await fetch(
        `${SERVER_BASE_URL}/api/profile/attachCoin`,
        {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            userId,
            attachmentData,
          }),
        },
      );
      const data = await response.json();
      if (!data.success) {
        return thunkAPI.rejectWithValue(data.error || 'Failed to attach coin');
      }
      return data.attachmentData as {
        coin: {mint: string; symbol?: string; name?: string};
      };
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.message || 'Attach coin request failed.',
      );
    }
  },
);

/**
 * Remove an attached coin from the user's profile.
 */
export const removeAttachedCoin = createAsyncThunk(
  'auth/removeAttachedCoin',
  async (
    {
      userId,
    }: {
      userId: string;
    },
    thunkAPI,
  ) => {
    try {
      const response = await fetch(
        `${SERVER_BASE_URL}/api/profile/removeAttachedCoin`,
        {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            userId,
          }),
        },
      );
      const data = await response.json();
      if (!data.success) {
        return thunkAPI.rejectWithValue(data.error || 'Failed to remove coin');
      }
      return data.success;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.message || 'Remove coin request failed.',
      );
    }
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess(
      state,
      action: PayloadAction<{
        address: string;
        profilePicUrl?: string;
        username?: string;
        description?: string;
      }>,
    ) {
      // Set provider to 'privy' always
      state.provider = 'privy';
      state.address = action.payload.address;
      state.isLoggedIn = true;
      
      // Only update these if they are provided or we don't have them
      if (action.payload.profilePicUrl || !state.profilePicUrl) {
        state.profilePicUrl = action.payload.profilePicUrl || state.profilePicUrl;
      }
      
      if (action.payload.username || !state.username) {
        state.username = action.payload.username || state.username;
      }
      
      if (action.payload.description || !state.description) {
        state.description = action.payload.description || state.description;
      }
    },
    logoutSuccess(state) {
      state.provider = null;
      state.address = null;
      state.isLoggedIn = false;
      state.profilePicUrl = null;
      state.username = null;
      state.description = null;
      state.attachmentData = {};
    },
    updateProfilePic(state, action: PayloadAction<string>) {
      state.profilePicUrl = action.payload;
    },
  },
  extraReducers: builder => {
    builder.addCase(fetchUserProfile.fulfilled, (state, action) => {
      const {
        profilePicUrl: fetchedProfilePicUrl,
        username: fetchedUsername,
        description: fetchedDescription,
        attachmentData,
      } = action.payload as any;

      // Get the userId that was requested as the argument to the thunk
      const requestedUserId = action.meta.arg;

      // Only update auth state if:
      // 1. We are logged in AND
      // 2. The requested user ID matches the current user's address
      if (state.isLoggedIn && 
          state.address && 
          requestedUserId && 
          requestedUserId.toLowerCase() === state.address.toLowerCase()) {
        state.profilePicUrl = fetchedProfilePicUrl || state.profilePicUrl;
        state.username = fetchedUsername || state.username;
        state.description = fetchedDescription || state.description;
        state.attachmentData = attachmentData || state.attachmentData || {};
      }
      // If the user IDs don't match, we don't update the auth state
    });

    builder.addCase(updateUsername.fulfilled, (state, action) => {
      state.username = action.payload;
    });

    builder.addCase(updateDescription.fulfilled, (state, action) => {
      state.description = action.payload;
    });

    builder.addCase(attachCoinToProfile.fulfilled, (state, action) => {
      if (state.address) {
        state.attachmentData = {coin: action.payload.coin};
      }
    });

    builder.addCase(removeAttachedCoin.fulfilled, (state) => {
      if (state.address) {
        // Remove the coin property from attachmentData
        if (state.attachmentData) {
          delete state.attachmentData.coin;
        }
      }
    });
  },
});

export const {loginSuccess, logoutSuccess, updateProfilePic} =
  authSlice.actions;
export default authSlice.reducer;
