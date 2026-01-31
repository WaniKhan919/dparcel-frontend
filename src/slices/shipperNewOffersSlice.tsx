import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { ApiHelper } from "../utils/ApiHelper";

interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  next_page_url?: string | null;
  prev_page_url?: string | null;
}

interface OfferState {
  data: any[];
  loading: boolean;
  error: string | null;
  meta: PaginationMeta | null;
  page: number;
  perPage: number;
}

const initialState: OfferState = {
  data: [],
  loading: false,
  error: null,
  meta: null,
  page: 1,
  perPage: 10,
};

export const fetchNewOffers = createAsyncThunk(
  "offers/fetch",
  async (
    {
      page,
      perPage,
      status,
    }: { page?: number; perPage?: number; status?: string },
    { rejectWithValue }
  ) => {
    try {
      const params = new URLSearchParams();

      params.append("page", String(page ?? 1));
      params.append("per_page", String(perPage ?? 10));

      if (status) {
        params.append("status", status); // 👈 filter param
      }

      const response = await ApiHelper(
        "GET",
        `/shipper/get/current-offers?${params.toString()}`
      );

      if (response.status === 200 && response.data?.data) {
        return response.data;
      }

      return rejectWithValue(response.data?.message || "Error fetching");
    } catch (err: any) {
      return rejectWithValue(err.message || "Error fetching");
    }
  }
);

const shipperNewOffersSlice = createSlice({
  name: "newOffer",
  initialState,
  reducers: {
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setPerPage: (state, action: PayloadAction<number>) => {
      state.perPage = action.payload;
    },
    resetOffers: (state) => {
      state.data = [];
      state.meta = null;
      state.page = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNewOffers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNewOffers.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
        state.meta = action.payload.meta;
      })
      .addCase(fetchNewOffers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});


export default shipperNewOffersSlice.reducer;
