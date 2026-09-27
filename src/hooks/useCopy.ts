import { useToast } from "./useToast";

export function useCopy() {
  const toast = useToast();

  return async (text: string, title: string, description?: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(title, description);
    } catch {
      toast.error("Couldn't copy", "Your browser blocked clipboard access.");
    }
  };
}
