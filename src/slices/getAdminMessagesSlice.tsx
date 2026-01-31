import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { ApiHelper } from "../utils/ApiHelper";

interface DataType {
  order_id?: number;
}

interface MessageRequestState {
  data: any[];
  meta: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: MessageRequestState = {
  data: [],
  meta: null,
  loading: false,
  error: null,
};

export const fetchAdminMessages = createAsyncThunk(
  'getAdminMessages/fetch',
  async ({order_id}:DataType , { rejectWithValue }) => {
    try {
      const response = await ApiHelper('GET', `/admin/messages/?order_id=${order_id}`);
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

const getAdminMessagesSlice = createSlice({
  name: "getAdminMessages",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
        state.meta = {
          currentPage: action.payload.current_page,
          lastPage: action.payload.last_page,
          perPage: action.payload.per_page,
          total: action.payload.total,
        };
      })
      .addCase(fetchAdminMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default getAdminMessagesSlice.reducer;
