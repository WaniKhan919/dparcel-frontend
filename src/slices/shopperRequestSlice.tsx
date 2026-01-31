import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { ApiHelper } from "../utils/ApiHelper";

export interface Request {
  id: number;
  name: string;
  ship_to: string;
  ship_from: string;
  service_type: string;
  total_aprox_weight: number;
}

interface RequestState {
  requests: Request[];
  loading: boolean;
  error: string | null;
}

const initialState: RequestState = {
  requests: [],
  loading: false,
  error: null,
};

// Only GET API here
export const fetchRequests = createAsyncThunk<Request[], void, { rejectValue: string }>(
  "request/fetchRequests",
  async (_, { rejectWithValue }) => {
    const response = await ApiHelper<{ data: Request[] }>("GET", "/shipper/get/requests");

    if (response.status >= 200 && response.status < 300) {
      return response.data.data; // unwrap data from API
    }

    return rejectWithValue(
      (response.data as any)?.message || "Failed to fetch request"
    );
  }
);

const shopperRequestSlice = createSlice({
  name: "requests",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRequests.fulfilled, (state, action: PayloadAction<Request[]>) => {
        state.loading = false;
        state.requests = action.payload;
      })
      .addCase(fetchRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
      });
  },
});

export default shopperRequestSlice.reducer;
