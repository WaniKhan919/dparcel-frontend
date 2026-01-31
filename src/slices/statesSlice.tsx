import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { ApiHelper } from "../utils/ApiHelper";

interface StateData {
  id: number;
  name: string;
  country_id: number;
}

interface StatesState {
  data: StateData[];
  loading: boolean;
  error: string | null;
}

const initialState: StatesState = {
  data: [],
  loading: false,
  error: null,
};

// Fetch states by country_id
export const fetchStates = createAsyncThunk(
  "states/fetch",
  async (countryId: number, { rejectWithValue }) => {
    try {
      const response = await ApiHelper("GET", `/states/${countryId}`);
      if (response.status === 200 && response.data?.data) {
        return response.data;
      } else {
        return rejectWithValue(response.data?.message || "Error fetching states");
      }
    } catch (err: any) {
      return rejectWithValue(err.message || "Error fetching states");
    }
  }
);

const statesSlice = createSlice({
  name: "states",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStates.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
      })
      .addCase(fetchStates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default statesSlice.reducer;
