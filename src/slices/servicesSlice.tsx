import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { ApiHelper } from "../utils/ApiHelper";

export interface Permission {
  id: number;
  title: string;
  price: number;
  description?: string;
  is_required?: number;
  status?: number;
}

interface Servicestate {
  services: Permission[];
  loading: boolean;
  error: string | null;
}

const initialState: Servicestate = {
  services: [],
  loading: false,
  error: null,
};

// Only GET API here
export const fetchServices = createAsyncThunk<Permission[], void, { rejectValue: string }>(
  "services/fetchServices",
  async (_, { rejectWithValue }) => {
    const response = await ApiHelper<{ data: Permission[] }>("GET", "/service");

    if (response.status >= 200 && response.status < 300) {
      return response.data.data;
    }

    return rejectWithValue(
      (response.data as any)?.message || "Failed to fetch services"
    );
  }
);

const servicesSlice = createSlice({
  name: "services",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchServices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServices.fulfilled, (state, action: PayloadAction<Permission[]>) => {
        state.loading = false;
        state.services = action.payload;
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
      });
  },
});

export default servicesSlice.reducer;
