import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { ApiHelper } from "../utils/ApiHelper";

interface CountryState {
  data: any[];
  meta: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: CountryState = {
  data: [],
  meta: null,
  loading: false,
  error: null,
};

export const fetchCountries = createAsyncThunk(
  'countries/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await ApiHelper('GET', `/countries`);
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

const countriesSlice = createSlice({
  name: "countries",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCountries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCountries.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
      })
      .addCase(fetchCountries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default countriesSlice.reducer;
