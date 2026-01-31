import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { ApiHelper } from "../utils/ApiHelper";

interface DataType {
  order_id?: number;
}

interface OrderRequestState {
  data: any[];
  meta: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: OrderRequestState = {
  data: [],
  meta: null,
  loading: false,
  error: null,
};

export const fetchMessages = createAsyncThunk(
  'getMessages/fetch',
  async ({order_id}:DataType , { rejectWithValue }) => {
    try {
      const response = await ApiHelper('GET', `/messages/?order_id=${order_id}`);
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

const getMessagesSlice = createSlice({
  name: "getMessages",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
        state.meta = {
          currentPage: action.payload.current_page,
          lastPage: action.payload.last_page,
          perPage: action.payload.per_page,
          total: action.payload.total,
        };
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default getMessagesSlice.reducer;
