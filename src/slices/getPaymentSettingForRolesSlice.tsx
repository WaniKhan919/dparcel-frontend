import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { ApiHelper } from "../utils/ApiHelper";

interface Params {
  shipping_types_id?: number | null;
}

interface PaymentPlanState {
  data: any[];
  loading: boolean;
  error: string | null;
}

const initialState: PaymentPlanState = {
  data: [],
  loading: false,
  error: null,
};

export const fetchPaymentPlan = createAsyncThunk(
  'paymentPlan/fetch',
  async ({ shipping_types_id }: Params, { rejectWithValue }) => {
    try {
      const response = await ApiHelper('GET', `/plans?shipping_types_id=${shipping_types_id}`);
      
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

const getPaymentSettingForRolesSlice = createSlice({
  name: "paymentPlan",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPaymentPlan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPaymentPlan.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
      })
      .addCase(fetchPaymentPlan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default getPaymentSettingForRolesSlice.reducer;
