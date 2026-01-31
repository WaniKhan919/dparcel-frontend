import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { ApiHelper } from "../utils/ApiHelper";

interface DataType {
  page?: number;
  per_page?: number;
  request_number?:string
  status?:string
  ship_from?:string
  ship_to?:string
  date?:string
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

export const fetchAllOrders = createAsyncThunk(
  'allOrderRequest/fetch',
  async ({ 
      page = 1, 
      per_page = 10,
      request_number,
      status,
      ship_from,
      ship_to,
      date,
    }:DataType, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: per_page.toString(),
      });

      if (request_number) params.append('request_number', request_number);
      if (status) params.append('status', status);
      if (ship_from) params.append('ship_from', ship_from);
      if (ship_to) params.append('ship_to', ship_to);
      if (date) params.append('date', date);

      const response = await ApiHelper('GET', `/order/all/orders?${params.toString()}`);
      
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

const allOrderSlice = createSlice({
  name: "allOrder",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
        state.meta = {
          currentPage: action.payload.current_page,
          lastPage: action.payload.last_page,
          perPage: action.payload.per_page,
          total: action.payload.total,
        };
      })
      .addCase(fetchAllOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default allOrderSlice.reducer;
