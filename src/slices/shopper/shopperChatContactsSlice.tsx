import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { ApiHelper } from "../../utils/ApiHelper";


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

export const fetchShopperChatContacts = createAsyncThunk(
  'shopperChatContacts/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await ApiHelper('GET', `/shopper/messages/contacts`);
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

const shopperChatContactsSlice = createSlice({
  name: "shopperChatContacts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchShopperChatContacts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchShopperChatContacts.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
      })
      .addCase(fetchShopperChatContacts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default shopperChatContactsSlice.reducer;
