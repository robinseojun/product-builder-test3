import { useEffect, useRef } from 'react';
import { Task } from '../types';
import { format } from 'date-fns';

export function useNotifications(tasks: Task[]) {
  const notifiedTasks = useRef<Set<string>>(new Set());

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentDate = format(now, 'yyyy-MM-dd');
      const currentTime = format(now, 'HH:mm');

      tasks.forEach(task => {
        if (
          !task.completed &&
          task.date === currentDate &&
          task.notificationTime === currentTime &&
          !notifiedTasks.current.has(task.id)
        ) {
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('일정 알림', {
              body: task.title,
            });
          }
          notifiedTasks.current.add(task.id);
        }
      });
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [tasks]);
}
