import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { ApiHelper } from "../utils/ApiHelper";

interface CityData {
  id: number;
  name: string;
  state_id: number;
}

interface CitiesState {
  data: CityData[];
  loading: boolean;
  error: string | null;
}

const initialState: CitiesState = {
  data: [],
  loading: false,
  error: null,
};

// Fetch cities by state_id
export const fetchCities = createAsyncThunk(
  "cities/fetch",
  async (stateId: number, { rejectWithValue }) => {
    try {
      const response = await ApiHelper("GET", `/cities/state/${stateId}`);
      if (response.status === 200 && response.data?.data) {
        return response.data;
      } else {
        return rejectWithValue(response.data?.message || "Error fetching cities");
      }
    } catch (err: any) {
      return rejectWithValue(err.message || "Error fetching cities");
    }
  }
);

const citiesSlice = createSlice({
  name: "cities",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCities.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
      })
      .addCase(fetchCities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default citiesSlice.reducer;
