import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { ApiHelper } from "../utils/ApiHelper";

export interface OrderStatus {
  id: number;
  name: string;
  description?: string;
}

interface OrderStatusState {
  orderStatus: OrderStatus[];
  loading: boolean;
  error: string | null;
}

const initialState: OrderStatusState = {
  orderStatus: [],
  loading: false,
  error: null,
};

// Only GET API here
export const fetchOrderStatus = createAsyncThunk<OrderStatus[], void, { rejectValue: string }>(
  "orderStatus/fetchOrderStatus",
  async (_, { rejectWithValue }) => {
    const response = await ApiHelper<{ data: OrderStatus[] }>("GET", "/order/statuses");

    if (response.status >= 200 && response.status < 300) {
      return response.data.data; // unwrap data from API
    }

    return rejectWithValue(
      (response.data as any)?.message || "Failed to fetch orderStatus"
    );
  }
);

const orderStatusSlice = createSlice({
  name: "orderStatus",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrderStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderStatus.fulfilled, (state, action: PayloadAction<OrderStatus[]>) => {
        state.loading = false;
        state.orderStatus = action.payload;
      })
      .addCase(fetchOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
      });
  },
});

export default orderStatusSlice.reducer;
