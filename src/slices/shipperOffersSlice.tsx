import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { ApiHelper } from "../utils/ApiHelper";

interface DataType {
  type?: number;
  page?: number;
  per_page?: number;
}
interface OfferState {
  data: any[];
  meta: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: OfferState = {
  data: [],
  meta: null,
  loading: false,
  error: null,
};

export const fetchOffers = createAsyncThunk(
  'offers/fetch',
  async ({ page = 1, per_page = 10 }:DataType, { rejectWithValue }) => {
    try {
      const response = await ApiHelper('GET', `/shipper/get/offers?page=${page}&per_page=${per_page}`);
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

const shipperOffersSlice = createSlice({
  name: "offer",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOffers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOffers.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data; 
        state.meta = {
          currentPage: action.payload.current_page,
          lastPage: action.payload.last_page,
          perPage: action.payload.per_page,
          total: action.payload.total,
        };
      })
      .addCase(fetchOffers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default shipperOffersSlice.reducer;
