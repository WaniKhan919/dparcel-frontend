import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { ApiHelper } from "../utils/ApiHelper";

interface DataType {
  page?: number;
  per_page?: number;
}
interface PaymentSettingState {
  data: any[];
  meta: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: PaymentSettingState = {
  data: [],
  meta: null,
  loading: false,
  error: null,
};

export const fetchPaymentSetting = createAsyncThunk(
  'paymentSetting/fetch',
  async ({ 
      page = 1, 
      per_page = 10,
    }:DataType, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: per_page.toString(),
      });
      
      const response = await ApiHelper('GET', `/admin/settings/payment?${params.toString()}`);
      
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

const paymentSettingSlice = createSlice({
  name: "paymentSetting",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPaymentSetting.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPaymentSetting.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data.data;
        state.meta = {
          currentPage: action.payload.current_page,
          lastPage: action.payload.last_page,
          perPage: action.payload.per_page,
          total: action.payload.total,
        };
      })
      .addCase(fetchPaymentSetting.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default paymentSettingSlice.reducer;
