import React, { useState } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Plus, Check, Trash2, Settings2, Bell, Pencil, Sparkles, Send, Clock, List } from 'lucide-react';
import { Task, Category } from '../types';

interface TaskListProps {
  date: Date;
  tasks: Task[];
  categories: Category[];
  selectedCategory: string | null;
  onAddTask: (title: string, date: string, categoryId?: string, notificationTime?: string, priority?: 'High' | 'Medium' | 'Low') => void;
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

  const [isParsing, setIsParsing] = useState(false);
  const [parsedTask, setParsedTask] = useState<any>(null);
  
  const [viewMode, setViewMode] = useState<'list' | 'timeline'>('list');

  const dateString = format(date, 'yyyy-MM-dd');
  const dayTasks = tasks.filter(t => t.date === dateString && (!selectedCategory || t.categoryId === selectedCategory));
  
  const completedCount = dayTasks.filter(t => t.completed).length;
  const totalCount = dayTasks.length;
  const progress = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    // Use AI Parsing
    setIsParsing(true);
    try {
      const currentDateTimeString = format(new Date(), "yyyy-MM-dd (EEEE) HH:mm", { locale: ko });
      const response = await fetch('/api/parse-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newTaskTitle.trim(), currentDate: currentDateTimeString })
      });
      
      if (response.ok) {
        const data = await response.json();
        setParsedTask(data);
      } else {
        alert("AI 일정 분석 중 오류가 발생했습니다. (API 설정 문제)");
        return;
      }
    } catch (err) {
      console.error(err);
      alert("AI 일정 분석 중 오류가 발생했습니다. 네트워크 상태를 확인해주세요.");
      return;
    } finally {
      setIsParsing(false);
    }
  };

  const confirmParsedTask = () => {
    if (!parsedTask) return;
    
    // Find category ID based on parsed category string if it exists
    let catId = undefined;
    if (parsedTask.category) {
      const existingCat = categories.find(c => c.name === parsedTask.category);
      if (existingCat) {
        catId = existingCat.id;
      }
      // If we want to create category dynamically we could, but let's stick to existing logic for now
    }
    
    onAddTask(
      parsedTask.title, 
      parsedTask.date || dateString, 
      catId, 
      parsedTask.startTime || parsedTask.time || undefined,
      parsedTask.priority
    );
    resetForm();
  };

  const resetForm = () => {
    setNewTaskTitle('');
    setNewTaskCategory('');
    setNewTaskTime('');
    setShowOptions(false);
    setParsedTask(null);
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
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button 
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md flex items-center justify-center transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('timeline')}
              className={`p-1.5 rounded-md flex items-center justify-center transition-colors ${viewMode === 'timeline' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
              title="Timeline View"
            >
              <Clock className="w-4 h-4" />
            </button>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <div className="px-3 py-1 text-[11px] font-bold bg-white rounded-md shadow-sm text-slate-900">
               {completedCount} / {totalCount} Done
            </div>
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

      <div className="flex-1 overflow-y-auto space-y-3 pr-2 pb-4 relative">
        {dayTasks.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 py-12 px-4">
            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-2 shadow-sm border border-indigo-100">
              <Sparkles className="w-8 h-8 text-indigo-400" />
            </div>
            <p className="text-sm font-medium text-slate-500">등록된 일정이 없습니다. AI에게 일정을 추가해달라고 말해보세요!</p>
            <div className="flex flex-col gap-2 w-full max-w-sm mt-4">
              <button 
                onClick={() => setNewTaskTitle("오늘 비는 시간에 할 일 추천해줘")} 
                className="px-4 py-3 bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-slate-600 text-xs font-bold rounded-xl transition-all shadow-sm text-left flex items-center gap-2 group"
              >
                <span className="text-indigo-500 group-hover:scale-110 transition-transform">+</span> 
                오늘 비는 시간에 할 일 추천받기
              </button>
              <button 
                onClick={() => setNewTaskTitle("매일 아침 9시 운동 일정 추가해줘")} 
                className="px-4 py-3 bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-slate-600 text-xs font-bold rounded-xl transition-all shadow-sm text-left flex items-center gap-2 group"
              >
                <span className="text-indigo-500 group-hover:scale-110 transition-transform">+</span> 
                루틴 일정 불러오기
              </button>
            </div>
          </div>
        ) : viewMode === 'timeline' ? (
          <div className="relative mt-2 flex flex-col pt-2 pb-8">
            {Array.from({ length: 16 }, (_, i) => i + 9).map(hour => {
              const hourStr = `${hour.toString().padStart(2, '0')}:00`;
              
              // Find tasks near this hour (naive approach for demonstration: match hour string)
              const tasksInHour = dayTasks.filter(t => t.notificationTime?.startsWith(`${hour.toString().padStart(2, '0')}`));
              
              return (
                <div key={hour} className="relative flex min-h-[60px] group">
                  <div className="w-14 shrink-0 text-right pr-4 pt-1 flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{hourStr}</span>
                  </div>
                  <div className="flex-1 border-t border-slate-100 border-dashed relative group-hover:border-slate-200 transition-colors">
                    <div className="flex flex-col gap-2 pt-2 pb-4 pr-2">
                      {tasksInHour.map(task => {
                        const category = categories.find(c => c.id === task.categoryId);
                        return (
                          <div 
                            key={task.id} 
                            className={`p-3 rounded-xl border flex items-center justify-between shadow-sm transition-all ${
                              task.completed ? 'bg-slate-50 border-slate-200 opacity-60' : 'bg-white border-indigo-100 hover:border-indigo-300'
                            }`}
                          >
                            <div className="flex flex-col">
                              <span className={`text-sm font-bold ${task.completed ? 'text-slate-500 line-through' : 'text-indigo-900'}`}>{task.title}</span>
                              {(category || task.priority) && (
                                <div className="flex items-center gap-2 mt-1">
                                  {category && (
                                    <span className="flex items-center gap-1 text-[9px] font-bold text-slate-500">
                                      <div className={`w-1.5 h-1.5 rounded-full ${category.color}`}></div>
                                      {category.name}
                                    </span>
                                  )}
                                  {task.priority && (
                                    <span className={`text-[8px] font-bold px-1 py-0.5 rounded-sm uppercase tracking-wider ${
                                      task.priority === 'High' ? 'bg-rose-100 text-rose-600' :
                                      task.priority === 'Medium' ? 'bg-amber-100 text-amber-600' :
                                      'bg-slate-200 text-slate-600'
                                    }`}>
                                      {task.priority}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                            <button 
                              onClick={() => onToggleTask(task.id)}
                              className={`w-4 h-4 rounded-sm flex items-center justify-center border-2 transition-colors ${
                                task.completed ? 'bg-emerald-500 border-emerald-500' : 'border-indigo-300 hover:border-indigo-500'
                              }`}
                            >
                              {task.completed && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
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
                    {(category || task.notificationTime || task.priority) && (
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
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
                        {task.priority && (
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider ${
                            task.priority === 'High' ? 'bg-rose-100 text-rose-600' :
                            task.priority === 'Medium' ? 'bg-amber-100 text-amber-600' :
                            'bg-slate-200 text-slate-600'
                          }`}>
                            {task.priority}
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

      <div className="pt-4 border-t border-slate-100 mt-auto relative">
        {parsedTask && (
          <div className="absolute bottom-full left-0 right-0 mb-4 bg-white border border-indigo-200 rounded-2xl shadow-xl overflow-hidden z-10 animate-in slide-in-from-bottom-2 fade-in">
            <div className="bg-indigo-50/50 px-4 py-3 border-b border-indigo-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-indigo-900">AI가 일정을 분석했어요</h3>
            </div>
            <div className="p-4 flex flex-col gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">제목</label>
                <div className="text-sm font-medium text-slate-900">{parsedTask.title}</div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">날짜</label>
                  <div className="text-sm font-medium text-slate-900">{parsedTask.date || dateString}</div>
                </div>
                {(parsedTask.startTime || parsedTask.time) && (
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">시간</label>
                    <div className="text-sm font-medium text-slate-900">{parsedTask.startTime || parsedTask.time}{parsedTask.endTime ? ` - ${parsedTask.endTime}` : ''}</div>
                  </div>
                )}
              </div>
              <div className="flex gap-4">
                {parsedTask.category && (
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">카테고리</label>
                    <div className="text-sm font-medium text-slate-900">{parsedTask.category}</div>
                  </div>
                )}
                {parsedTask.priority && (
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">우선순위</label>
                    <div className="text-sm font-medium text-slate-900">{parsedTask.priority}</div>
                  </div>
                )}
              </div>
              <div className="flex gap-2 mt-2">
                <button 
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                >
                  취소
                </button>
                <button 
                  type="button"
                  onClick={confirmParsedTask}
                  className="flex-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
                >
                  일정 등록
                </button>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 relative">
          <div className="flex gap-2 relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-indigo-100/50 text-indigo-500 flex items-center justify-center pointer-events-none">
              <Sparkles className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="자연어로 일정을 입력해 보세요 (예: 내일 오후 3시 팀 회의 잡아줘)"
              className="flex-1 pl-12 pr-4 py-3.5 bg-slate-50 border border-indigo-100 rounded-2xl text-sm text-slate-900 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium placeholder-slate-400 shadow-inner"
              disabled={isParsing || !!parsedTask}
            />
            <button
              type="submit"
              disabled={!newTaskTitle.trim() || isParsing || !!parsedTask}
              className="px-4 py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-2xl text-sm font-semibold transition-colors shadow-sm flex items-center justify-center min-w-[56px]"
            >
              {isParsing ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
