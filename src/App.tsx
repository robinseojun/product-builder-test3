import React, { useState } from 'react';
import { format } from 'date-fns';
import { Calendar } from './components/Calendar';
import { TaskList } from './components/TaskList';
import { useTasks } from './hooks/useTasks';
import { Layout, Plus, X } from 'lucide-react';
import { useNotifications } from './hooks/useNotifications';

export default function App() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { tasks, addTask, toggleTask, deleteTask, updateTask, categories, addCategory, deleteCategory } = useTasks();
  
  useNotifications(tasks);

  const taskDates = Array.from(new Set(tasks.map(t => t.date)));

  const [newCatName, setNewCatName] = useState('');
  const [showAddCat, setShowAddCat] = useState(false);

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCatName.trim()) {
      const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-purple-500', 'bg-sky-500', 'bg-indigo-500'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      addCategory(newCatName.trim(), randomColor);
      setNewCatName('');
      setShowAddCat(false);
    }
  };

  return (
    <div className="h-screen bg-slate-50 flex flex-col font-sans text-slate-900 overflow-hidden">
      <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
            <Layout className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Daily Planner</h1>
            <p className="text-xs text-slate-500 font-medium">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 lg:grid-rows-6 gap-6 max-w-7xl mx-auto w-full overflow-y-auto lg:overflow-hidden">
        <div className="lg:col-span-4 lg:row-span-6 flex flex-col gap-6">
          <Calendar 
            selectedDate={selectedDate} 
            onSelectDate={setSelectedDate} 
            taskDates={taskDates}
          />
          
          <div className="bg-slate-200/50 rounded-3xl p-5 border border-slate-300/50 hidden lg:flex flex-col flex-1 min-h-[200px]">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-sm">Categories</h2>
              <button onClick={() => setShowAddCat(!showAddCat)} className="p-1 hover:bg-slate-300/50 rounded-md transition-colors">
                <Plus className="w-4 h-4 text-slate-600" />
              </button>
            </div>
            
            {showAddCat && (
              <form onSubmit={handleAddCategory} className="mb-3 flex gap-2">
                <input 
                  type="text" 
                  value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                  placeholder="새 카테고리..." 
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-indigo-500"
                  autoFocus
                />
                <button type="submit" className="px-3 py-1.5 text-xs bg-indigo-600 text-white rounded-lg font-medium">Add</button>
              </form>
            )}

            <div className="flex flex-wrap gap-2 overflow-y-auto content-start flex-1 pr-2">
              <div 
                onClick={() => setSelectedCategory(null)}
                className={`group relative flex items-center px-3 py-1.5 rounded-full text-[11px] font-bold shadow-sm cursor-pointer transition-all ${
                  selectedCategory === null 
                    ? 'bg-slate-800 text-white' 
                    : 'bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                전체보기
              </div>
              {categories.map(cat => (
                <div 
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`group relative flex items-center gap-1.5 pl-2.5 pr-2 py-1.5 rounded-full text-[11px] font-bold shadow-sm cursor-pointer transition-all ${
                    selectedCategory === cat.id 
                      ? `bg-slate-800 text-white` 
                      : 'bg-white text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${cat.color}`}></div>
                  {cat.name}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteCategory(cat.id);
                      if (selectedCategory === cat.id) setSelectedCategory(null);
                    }}
                    className={`ml-1 p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${
                      selectedCategory === cat.id ? 'hover:bg-slate-700' : 'hover:bg-slate-200'
                    }`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-8 lg:row-span-6 flex flex-col h-full lg:overflow-hidden min-h-[500px]">
          <TaskList 
            date={selectedDate}
            tasks={tasks}
            categories={categories}
            selectedCategory={selectedCategory}
            onAddTask={addTask}
            onToggleTask={toggleTask}
            onDeleteTask={deleteTask}
            onUpdateTask={updateTask}
          />
        </div>
      </main>
    </div>
  );
}
