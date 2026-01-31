import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { ApiHelper } from "../utils/ApiHelper";

export interface ShipingType {
  id: number;
  title: string;
}

interface ShipingTypestate {
  shippingType: ShipingType[];
  loading: boolean;
  error: string | null;
}

const initialState: ShipingTypestate = {
  shippingType: [],
  loading: false,
  error: null,
};

// Only GET API here
export const fetchShippingType = createAsyncThunk<ShipingType[], void, { rejectValue: string }>(
  "shippingTypes/fetchShippingType",
  async (_, { rejectWithValue }) => {
    const response = await ApiHelper<{ data: ShipingType[] }>("GET", "/shipping-types");

    if (response.status >= 200 && response.status < 300) {
      return response.data.data;
    }

    return rejectWithValue(
      (response.data as any)?.message || "Failed to fetch shippingType"
    );
  }
);

const shippingTypeSlice = createSlice({
  name: "shippingType",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchShippingType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchShippingType.fulfilled, (state, action: PayloadAction<ShipingType[]>) => {
        state.loading = false;
        state.shippingType = action.payload;
      })
      .addCase(fetchShippingType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
      });
  },
});

export default shippingTypeSlice.reducer;
