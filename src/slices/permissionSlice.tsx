import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { ApiHelper } from "../utils/ApiHelper";

export interface Permission {
  id: number;
  name: string;
  description?: string;
}

interface PermissionState {
  permissions: Permission[];
  loading: boolean;
  error: string | null;
}

const initialState: PermissionState = {
  permissions: [],
  loading: false,
  error: null,
};

// Only GET API here
export const fetchPermission = createAsyncThunk<Permission[], void, { rejectValue: string }>(
  "permissions/fetchPermission",
  async (_, { rejectWithValue }) => {
    const response = await ApiHelper<{ data: Permission[] }>("GET", "/permissions");

    if (response.status >= 200 && response.status < 300) {
      return response.data.data;
    }

    return rejectWithValue(
      (response.data as any)?.message || "Failed to fetch permissions"
    );
  }
);

const permissionSlice = createSlice({
  name: "permissions",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPermission.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPermission.fulfilled, (state, action: PayloadAction<Permission[]>) => {
        state.loading = false;
        state.permissions = action.payload;
      })
      .addCase(fetchPermission.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
      });
  },
});

export default permissionSlice.reducer;
