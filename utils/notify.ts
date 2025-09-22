import { showMessage, MessageOptions } from "react-native-flash-message";

type NotifyOptions = Omit<MessageOptions, "type" | "message">;

export const notify = {
  success: (message: string, options: NotifyOptions = {}) =>
    showMessage({
      message,
      type: "success",
      duration: 2000,
      ...options,
    }),

  error: (message: string, options: NotifyOptions = {}) =>
    showMessage({
      message,
      type: "danger",
      duration: 2500,
      ...options,
    }),

  info: (message: string, options: NotifyOptions = {}) =>
    showMessage({
      message,
      type: "info",
      duration: 2000,
      ...options,
    }),
};
