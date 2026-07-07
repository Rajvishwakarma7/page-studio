import { configureStore } from "@reduxjs/toolkit";
import { draftPageReducer } from "./draftPageSlice";
import { publishReducer } from "./publishSlice";
import { uiReducer } from "./uiSlice";

export function makeStore() {
  return configureStore({
    reducer: {
      draftPage: draftPageReducer,
      publish: publishReducer,
      ui: uiReducer,
    },
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
