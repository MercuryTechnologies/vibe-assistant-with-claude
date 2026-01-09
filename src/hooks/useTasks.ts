import { useEffect, useMemo, useState } from 'react';
import type { Task } from '@/types';
import tasksData from '@/data/tasks.json';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTasks(tasksData.tasks as Task[]);
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const incompleteCount = useMemo(
    () => tasks.filter((t) => t.status === 'incomplete').length,
    [tasks],
  );

  return { tasks, incompleteCount, isLoading };
}

