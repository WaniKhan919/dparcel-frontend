import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { ApiHelper } from "../utils/ApiHelper";

interface ChatState {
  data: any[];
  loading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  data: [],
  loading: false,
  error: null,
};

export const fetchChatContacts = createAsyncThunk(
  'chatContacts/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await ApiHelper('GET', `/chat/contacts`);
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

const chatContactsSlice = createSlice({
  name: "chatContacts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchChatContacts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChatContacts.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
      })
      .addCase(fetchChatContacts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default chatContactsSlice.reducer;
