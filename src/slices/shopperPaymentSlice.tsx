import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { ApiHelper } from "../utils/ApiHelper";

interface DataType {
  page?: number;
  per_page?: number;
}
interface PaymentState {
  data: any[];
  meta: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: PaymentState = {
  data: [],
  meta: null,
  loading: false,
  error: null,
};

export const fetchPayments = createAsyncThunk(
  'payments/fetch',
  async ({ page = 1, per_page = 10 }:DataType, { rejectWithValue }) => {
    try {
      const response = await ApiHelper('GET', `/shopper/payments?page=${page}&per_page=${per_page}`);
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

const shopperPaymentSlice = createSlice({
  name: "payments",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPayments.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
        state.meta = {
          currentPage: action.payload.current_page,
          lastPage: action.payload.last_page,
          perPage: action.payload.per_page,
          total: action.payload.total,
        };
      })
      .addCase(fetchPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default shopperPaymentSlice.reducer;
