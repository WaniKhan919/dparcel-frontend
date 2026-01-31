import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { ApiHelper } from "../utils/ApiHelper";

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
export const fetchChatMessages = createAsyncThunk(
  "chatMessages/fetch",
  async (orderId: number, { rejectWithValue }) => {
    try {
      const response = await ApiHelper("GET", `/chat/messages/${orderId}`);
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

const chatMessagesSlice = createSlice({
  name: "chatMessages",
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
      .addCase(fetchChatMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChatMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchChatMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { addMessage, clearMessages } = chatMessagesSlice.actions;
export default chatMessagesSlice.reducer;
