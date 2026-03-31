import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Task, TaskStatus } from "@/types";

export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: TaskStatus }) => {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return { taskId, status };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}
