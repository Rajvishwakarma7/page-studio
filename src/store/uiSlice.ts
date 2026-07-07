import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type UiState = {
  selectedSectionId: string | null;
};

const initialState: UiState = {
  selectedSectionId: null,
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    selectSection(state, action: PayloadAction<string | null>) {
      state.selectedSectionId = action.payload;
    },
  },
});

export const { selectSection } = uiSlice.actions;
export const uiReducer = uiSlice.reducer;
