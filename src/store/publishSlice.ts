import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type PublishState = {
  status: "idle" | "publishing" | "published" | "failed";
  message: string | null;
  version: string | null;
};

const initialState: PublishState = {
  status: "idle",
  message: null,
  version: null,
};

export const publishSlice = createSlice({
  name: "publish",
  initialState,
  reducers: {
    publishStarted(state) {
      state.status = "publishing";
      state.message = null;
      state.version = null;
    },
    publishSucceeded(
      state,
      action: PayloadAction<{
        message: string;
        version: string;
      }>,
    ) {
      state.status = "published";
      state.message = action.payload.message;
      state.version = action.payload.version;
    },
    publishFailed(state, action: PayloadAction<string>) {
      state.status = "failed";
      state.message = action.payload;
      state.version = null;
    },
    resetPublishState(state) {
      state.status = "idle";
      state.message = null;
      state.version = null;
    },
  },
});

export const {
  publishFailed,
  publishStarted,
  publishSucceeded,
  resetPublishState,
} = publishSlice.actions;
export const publishReducer = publishSlice.reducer;
