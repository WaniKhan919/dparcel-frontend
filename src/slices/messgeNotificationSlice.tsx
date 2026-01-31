import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { ApiHelper } from "../utils/ApiHelper";

export interface MessageNotificationItem {
  id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

interface NotificationState {
  notifications: MessageNotificationItem[];
  currentPage: number;
  lastPage: number;
  total: number;
  loading: boolean;
  error: string | null;
}

const initialState: NotificationState = {
  notifications: [],
  currentPage: 1,
  lastPage: 1,
  total: 0,
  loading: false,
  error: null,
};

// Fetch notifications with optional page and type
export const fetchMessageNotifications = createAsyncThunk<
  { data: MessageNotificationItem[]; current_page: number; last_page: number; total: number },
  { page?: number; type?: string } | undefined,
  { rejectValue: string }
>("messageNotifications/fetchMessageNotifications", async (params, { rejectWithValue }) => {
  try {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", params.page.toString());
    if (params?.type) query.append("type", params.type);

    const response = await ApiHelper<{ data: any }>(
      "GET",
      "/notifications?" + query.toString()
    );

    if (response.status >= 200 && response.status < 300) {
      return {
        data: response.data.data.data, // actual notifications array
        current_page: response.data.data.current_page,
        last_page: response.data.data.last_page,
        total: response.data.data.total,
      };
    }

    return rejectWithValue((response.data as any)?.message || "Failed to fetch notifications");
  } catch (err: any) {
    return rejectWithValue(err.message || "Failed to fetch notifications");
  }
});

const messgeNotificationSlice = createSlice({
  name: "messageNotifications",
  initialState,
  reducers: {
    clearNotifications(state) {
      state.notifications = [];
      state.currentPage = 1;
      state.lastPage = 1;
      state.total = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessageNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessageNotifications.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        // Append new notifications if page > 1
        if (action.payload.current_page > 1) {
          state.notifications = [...state.notifications, ...action.payload.data];
        } else {
          state.notifications = action.payload.data;
        }
        state.currentPage = action.payload.current_page;
        state.lastPage = action.payload.last_page;
        state.total = action.payload.total;
      })
      .addCase(fetchMessageNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
      });
  },
});

export const { clearNotifications } = messgeNotificationSlice.actions;
export default messgeNotificationSlice.reducer;
