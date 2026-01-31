import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { ApiHelper } from "../utils/ApiHelper";

export interface Role {
  id: number;
  name: string;
  description?: string;
}

interface RoleState {
  roles: Role[];
  loading: boolean;
  error: string | null;
}

const initialState: RoleState = {
  roles: [],
  loading: false,
  error: null,
};

// Only GET API here
export const fetchRoles = createAsyncThunk<Role[], void, { rejectValue: string }>(
  "roles/fetchRoles",
  async (_, { rejectWithValue }) => {
    const response = await ApiHelper<{ data: Role[] }>("GET", "/roles");

    if (response.status >= 200 && response.status < 300) {
      return response.data.data; // unwrap data from API
    }

    return rejectWithValue(
      (response.data as any)?.message || "Failed to fetch roles"
    );
  }
);

const roleSlice = createSlice({
  name: "roles",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoles.fulfilled, (state, action: PayloadAction<Role[]>) => {
        state.loading = false;
        state.roles = action.payload;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
      });
  },
});

export default roleSlice.reducer;
