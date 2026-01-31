import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { ApiHelper } from "../utils/ApiHelper";


interface messageState {
  data: any[];
  loading: boolean;
  error: string | null;
}

const initialState: messageState = {
  data: [],
  loading: false,
  error: null,
};

export const fetchLatestMessages = createAsyncThunk(
  'getMessLatestages/fetch',
  async (_ , { rejectWithValue }) => {
    try {
      const response = await ApiHelper('GET', `/chat/latest-messages`);
      if (response.status === 200 && response.data?.data) {
        return response.data;
      } else {
        return rejectWithValue(response.data?.message || 'Error fetching');
      }
    } catch (err:any) {
      return rejectWithValue(err.message || 'Error fetching');
    }
  }
);

const latestChatsSlice = createSlice({
  name: "getLatestMessages",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLatestMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLatestMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
      })
      .addCase(fetchLatestMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default latestChatsSlice.reducer;
