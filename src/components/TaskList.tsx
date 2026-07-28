import React, { useState } from 'react';
import { format } from 'date-fns';
import { Plus, Check, Trash2, Settings2, Bell, Pencil } from 'lucide-react';
import { Task, Category } from '../types';

interface TaskListProps {
  date: Date;
  tasks: Task[];
  categories: Category[];
  selectedCategory: string | null;
  onAddTask: (title: string, date: string, categoryId?: string, notificationTime?: string) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
}

export function TaskList({ date, tasks, categories, selectedCategory, onAddTask, onToggleTask, onDeleteTask, onUpdateTask }: TaskListProps) {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<string>('');
  const [newTaskTime, setNewTaskTime] = useState<string>('');
  const [showOptions, setShowOptions] = useState(false);
  
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState<string>('');
  const [editTime, setEditTime] = useState<string>('');

  const dateString = format(date, 'yyyy-MM-dd');
  const dayTasks = tasks.filter(t => t.date === dateString && (!selectedCategory || t.categoryId === selectedCategory));
  
  const completedCount = dayTasks.filter(t => t.completed).length;
  const totalCount = dayTasks.length;
  const progress = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      onAddTask(newTaskTitle.trim(), dateString, newTaskCategory || undefined, newTaskTime || undefined);
      setNewTaskTitle('');
      setNewTaskCategory('');
      setNewTaskTime('');
      setShowOptions(false);
    }
  };

  const startEditing = (task: Task) => {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditCategory(task.categoryId || '');
    setEditTime(task.notificationTime || '');
  };

  const saveEdit = (id: string) => {
    if (editTitle.trim()) {
      onUpdateTask(id, {
        title: editTitle.trim(),
        categoryId: editCategory || undefined,
        notificationTime: editTime || undefined,
      });
      setEditingTaskId(null);
    }
  };

  const cancelEdit = () => {
    setEditingTaskId(null);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Agenda for {format(date, 'MMM d')}</h2>
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
            {format(date, 'EEEE')} {selectedCategory && `• ${categories.find(c => c.id === selectedCategory)?.name}`}
          </p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <div className="px-3 py-1 text-[11px] font-bold bg-white rounded-md shadow-sm text-slate-900">
             {completedCount} / {totalCount} Done
          </div>
        </div>
      </div>

      {totalCount > 0 && (
        <div className="w-full bg-slate-100 rounded-full h-1 mb-4">
          <div 
            className="bg-indigo-500 h-1 rounded-full transition-all duration-500 ease-out" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-3 pr-2 pb-4">
        {dayTasks.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 py-12">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
              <Check className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-sm font-medium">등록된 일정이 없습니다.</p>
          </div>
        ) : (
          dayTasks.map(task => {
            const category = categories.find(c => c.id === task.categoryId);
            
            if (editingTaskId === task.id) {
              return (
                <div key={task.id} className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-200 shadow-sm flex flex-col gap-3">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                  <div className="flex gap-2">
                    <select
                      value={editCategory}
                      onChange={e => setEditCategory(e.target.value)}
                      className="flex-1 px-3 py-2 bg-white border border-indigo-200 rounded-lg text-xs focus:outline-none"
                    >
                      <option value="">카테고리 없음</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                    <input
                      type="time"
                      value={editTime}
                      onChange={e => setEditTime(e.target.value)}
                      className="flex-1 px-3 py-2 bg-white border border-indigo-200 rounded-lg text-xs focus:outline-none"
                    />
                  </div>
                  <div className="flex justify-end gap-2 mt-1">
                    <button onClick={cancelEdit} className="px-3 py-1.5 text-xs font-bold text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors">취소</button>
                    <button onClick={() => saveEdit(task.id)} className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm">저장</button>
                  </div>
                </div>
              );
            }
            
            return (
              <div 
                key={task.id} 
                className={`group flex items-center gap-4 p-4 rounded-2xl transition-colors border ${
                  task.completed 
                    ? 'border-transparent opacity-60 grayscale hover:bg-slate-50 hover:border-slate-100' 
                    : 'bg-indigo-50/50 border-indigo-100'
                }`}
              >
                <button 
                  onClick={() => onToggleTask(task.id)}
                  className={`mt-1 w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 cursor-pointer transition-colors ${
                    task.completed
                      ? 'bg-emerald-500 border-2 border-emerald-500'
                      : 'border-2 border-indigo-400'
                  }`}
                >
                  {task.completed ? (
                     <Check className="w-3 h-3 text-white stroke-[3]" />
                  ) : (
                    <div className="w-2 h-2 bg-indigo-600 rounded-sm opacity-0 group-hover:opacity-50"></div>
                  )}
                </button>
                
                <div className="flex-1 flex items-center justify-between min-w-0">
                  <div className="flex flex-col min-w-0">
                    <span 
                      className={`text-sm md:text-base truncate transition-colors ${
                        task.completed ? 'text-slate-800 line-through font-bold' : 'text-indigo-900 font-bold'
                      }`}
                    >
                      {task.title}
                    </span>
                    {(category || task.notificationTime) && (
                      <div className="flex items-center gap-2 mt-1">
                        {category && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
                            <div className={`w-1.5 h-1.5 rounded-full ${category.color}`}></div>
                            {category.name}
                          </span>
                        )}
                        {task.notificationTime && (
                          <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                            <Bell className="w-3 h-3" /> {task.notificationTime}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => startEditing(task)}
                      className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg transition-all focus:outline-none"
                      aria-label="Edit task"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => onDeleteTask(task.id)}
                      className="p-2 text-slate-400 hover:text-red-500 rounded-lg transition-all focus:outline-none"
                      aria-label="Delete task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="pt-4 border-t border-slate-100 mt-auto">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {showOptions && (
            <div className="flex flex-wrap gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex-1 min-w-[120px]">
                <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">카테고리</label>
                <select 
                  value={newTaskCategory}
                  onChange={e => setNewTaskCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">선택 안함</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1 min-w-[120px]">
                <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">알림 시간 (선택)</label>
                <input 
                  type="time" 
                  value={newTaskTime}
                  onChange={e => setNewTaskTime(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}
          
          <div className="flex gap-2 relative">
            <button
              type="button"
              onClick={() => setShowOptions(!showOptions)}
              className={`absolute left-3 top-1/2 -translate-y-1/2 p-1.5 rounded-md transition-colors ${showOptions ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
            >
              <Settings2 className="w-4 h-4" />
            </button>
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="추가할 일정을 입력하세요..."
              className="flex-1 pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium placeholder-slate-400"
            />
            <button
              type="submit"
              disabled={!newTaskTitle.trim()}
              className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm flex items-center justify-center"
            >
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
