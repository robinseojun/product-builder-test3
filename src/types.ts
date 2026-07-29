export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  date: string; // YYYY-MM-DD format
  categoryId?: string;
  notificationTime?: string; // HH:mm format
  priority?: 'High' | 'Medium' | 'Low';
}
