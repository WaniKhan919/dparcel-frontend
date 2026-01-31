import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { ApiHelper } from "../utils/ApiHelper";

export interface Product {
  id: number;
  name: string;
  description?: string;
}

interface ProductState {
  products: Product[];
  loading: boolean;
  error: string | null;
}

const initialState: ProductState = {
  products: [],
  loading: false,
  error: null,
};

// Only GET API here
export const fetchProduct = createAsyncThunk<Product[], void, { rejectValue: string }>(
  "products/fetchProduct",
  async (_, { rejectWithValue }) => {
    const response = await ApiHelper<{ data: Product[] }>("GET", "/products");

    if (response.status >= 200 && response.status < 300) {
      return response.data.data;
    }

    return rejectWithValue(
      (response.data as any)?.message || "Failed to fetch products"
    );
  }
);

const permissionSlice = createSlice({
  name: "products",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProduct.fulfilled, (state, action: PayloadAction<Product[]>) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
      });
  },
});

export default permissionSlice.reducer;
