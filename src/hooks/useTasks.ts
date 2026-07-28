import { useState, useEffect } from 'react';
import { Task, Category } from '../types';

const defaultCategories: Category[] = [
  { id: 'c1', name: '업무', color: 'bg-blue-500' },
  { id: 'c2', name: '개인', color: 'bg-emerald-500' },
  { id: 'c3', name: '약속', color: 'bg-amber-500' },
];

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('planner_tasks');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('planner_categories');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return defaultCategories;
      }
    }
    return defaultCategories;
  });

  useEffect(() => {
    localStorage.setItem('planner_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('planner_categories', JSON.stringify(categories));
  }, [categories]);

  const addTask = (title: string, date: string, categoryId?: string, notificationTime?: string) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      completed: false,
      date,
      categoryId,
      notificationTime
    };
    setTasks((prev) => [...prev, newTask]);
  };

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const addCategory = (name: string, color: string) => {
    const newCategory: Category = {
      id: crypto.randomUUID(),
      name,
      color,
    };
    setCategories((prev) => [...prev, newCategory]);
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  return { tasks, addTask, toggleTask, deleteTask, categories, addCategory, deleteCategory };
}
