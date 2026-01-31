import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { ApiHelper } from "../../utils/ApiHelper";


interface DataType {
  page?: number;
  per_page?: number;
}
interface BlogState {
  data: any[];
  meta: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: BlogState = {
  data: [],
  meta: null,
  loading: false,
  error: null,
};

export const fetchBlogs = createAsyncThunk(
  'fetchBlogs/fetch',
  async ({ 
      page = 1, 
      per_page = 10,
    }:DataType, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: per_page.toString(),
      });

      const response = await ApiHelper('GET', `/admin/blogs/?${params.toString()}`);
      
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

const getBlogsSlice = createSlice({
  name: "fetchBlog",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBlogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBlogs.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
        state.meta = {
          currentPage: action.payload.current_page,
          lastPage: action.payload.last_page,
          perPage: action.payload.per_page,
          total: action.payload.total,
        };
      })
      .addCase(fetchBlogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default getBlogsSlice.reducer;
