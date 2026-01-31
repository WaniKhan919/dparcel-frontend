import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { ApiHelper } from "../../utils/ApiHelper";

interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  message_text: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface ChatMessagesState {
  data: Message[];
  loading: boolean;
  error: string | null;
}

const initialState: ChatMessagesState = {
  data: [],
  loading: false,
  error: null,
};

// 🔹 Fetch messages for a specific order
export const fetchShopperChatMessages = createAsyncThunk(
  "shopperChatMessages/fetch",
  async (orderId: number, { rejectWithValue }) => {
    try {
      const response = await ApiHelper("GET", `/shopper/messages/${orderId}`);
      if (response.status === 200 && response.data?.data) {
        return response.data.data;
      } else {
        return rejectWithValue(response.data?.message || "Error fetching messages");
      }
    } catch (err: any) {
      return rejectWithValue(err.message || "Error fetching messages");
    }
  }
);

const shopperMessagesSlice = createSlice({
  name: "shopperChatMessages",
  initialState,
  reducers: {
    // optional: add new message locally
    addMessage: (state, action: PayloadAction<Message>) => {
      state.data.push(action.payload);
    },
    clearMessages: (state) => {
      state.data = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchShopperChatMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchShopperChatMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchShopperChatMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { addMessage, clearMessages } = shopperMessagesSlice.actions;
export default shopperMessagesSlice.reducer;
