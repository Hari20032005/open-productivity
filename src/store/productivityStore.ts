import { create } from "zustand";

export type Priority = "low" | "medium" | "high" | "urgent";
export type TaskStatus = "pending" | "in_progress" | "completed";

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  status: TaskStatus;
  dueDate?: string;
  project?: string;
  tags: string[];
  createdAt: string;
  completedAt?: string;
  isRecurring: boolean;
  recurringInterval?: "daily" | "weekly";
}

export interface FocusSession {
  id: string;
  startTime: string;
  endTime?: string;
  durationMinutes: number;
  completedPomodoros: number;
  taskId?: string;
  notes?: string;
}

export interface HabitItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: "health" | "mindfulness" | "social" | "learning" | "fitness";
  streak: number;
  longestStreak: number;
  lastCompleted?: string;
  completedDates: string[];
}

interface ProductivityState {
  tasks: Task[];
  focusSessions: FocusSession[];
  habits: HabitItem[];
  activePomodoroDuration: number; // minutes
  activeBreakDuration: number;
  currentSession: FocusSession | null;
  pomodorosCompletedToday: number;

  // Task actions
  addTask: (task: Omit<Task, "id" | "createdAt">) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  completeTask: (id: string) => void;
  deleteTask: (id: string) => void;
  getTodayTasks: () => Task[];
  getTopPriorityTasks: (n?: number) => Task[];

  // Focus actions
  startFocusSession: (taskId?: string) => void;
  endFocusSession: (completedPomodoros: number) => void;
  setPomodoroSettings: (work: number, breakMin: number) => void;

  // Habit actions
  initDefaultHabits: () => void;
  completeHabit: (id: string) => void;
  addHabit: (habit: Omit<HabitItem, "id" | "streak" | "longestStreak" | "completedDates">) => void;
  isHabitCompletedToday: (id: string) => boolean;
}

const DEFAULT_HABITS: Array<Omit<HabitItem, "id" | "streak" | "longestStreak" | "completedDates">> = [
  { title: "Morning Exercise", description: "30 min workout", icon: "🏋️", category: "fitness", lastCompleted: undefined },
  { title: "Meditation", description: "10 min mindfulness", icon: "🧘", category: "mindfulness", lastCompleted: undefined },
  { title: "Read a Book", description: "20 pages minimum", icon: "📚", category: "learning", lastCompleted: undefined },
  { title: "Cold Shower", description: "Builds discipline", icon: "🚿", category: "health", lastCompleted: undefined },
  { title: "No Phone First Hour", description: "Protect your morning", icon: "📵", category: "mindfulness", lastCompleted: undefined },
  { title: "Connect with Someone", description: "Real conversation", icon: "🤝", category: "social", lastCompleted: undefined },
];

export const useProductivityStore = create<ProductivityState>((set, get) => ({
  tasks: [],
  focusSessions: [],
  habits: [],
  activePomodoroDuration: 25,
  activeBreakDuration: 5,
  currentSession: null,
  pomodorosCompletedToday: 0,

  addTask: (task) => {
    const newTask: Task = {
      ...task,
      id: `task_${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: "pending",
      tags: task.tags ?? [],
      isRecurring: task.isRecurring ?? false,
    };
    set((state) => ({ tasks: [newTask, ...state.tasks] }));
  },

  updateTask: (id, updates) => {
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }));
  },

  completeTask: (id) => {
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id
          ? { ...t, status: "completed", completedAt: new Date().toISOString() }
          : t
      ),
    }));
  },

  deleteTask: (id) => {
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));
  },

  getTodayTasks: () => {
    const today = new Date().toDateString();
    return get().tasks.filter((t) => {
      if (t.status === "completed" && t.completedAt) {
        return new Date(t.completedAt).toDateString() === today;
      }
      if (t.dueDate) return new Date(t.dueDate).toDateString() === today;
      return t.status !== "completed";
    });
  },

  getTopPriorityTasks: (n = 3) => {
    const priorityOrder: Record<Priority, number> = {
      urgent: 0,
      high: 1,
      medium: 2,
      low: 3,
    };
    return get()
      .tasks.filter((t) => t.status !== "completed")
      .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
      .slice(0, n);
  },

  startFocusSession: (taskId) => {
    const session: FocusSession = {
      id: `session_${Date.now()}`,
      startTime: new Date().toISOString(),
      durationMinutes: get().activePomodoroDuration,
      completedPomodoros: 0,
      taskId,
    };
    set({ currentSession: session });
  },

  endFocusSession: (completedPomodoros) => {
    const session = get().currentSession;
    if (!session) return;
    const ended: FocusSession = {
      ...session,
      endTime: new Date().toISOString(),
      completedPomodoros,
    };
    set((state) => ({
      focusSessions: [ended, ...state.focusSessions],
      currentSession: null,
      pomodorosCompletedToday: state.pomodorosCompletedToday + completedPomodoros,
    }));
  },

  setPomodoroSettings: (work, breakMin) => {
    set({ activePomodoroDuration: work, activeBreakDuration: breakMin });
  },

  initDefaultHabits: () => {
    const habits: HabitItem[] = DEFAULT_HABITS.map((h, i) => ({
      ...h,
      id: `habit_${i}`,
      streak: 0,
      longestStreak: 0,
      completedDates: [],
    }));
    set({ habits });
  },

  completeHabit: (id) => {
    const today = new Date().toDateString();
    set((state) => ({
      habits: state.habits.map((h) => {
        if (h.id !== id) return h;
        if (h.completedDates.includes(today)) return h;
        const newStreak = h.streak + 1;
        return {
          ...h,
          streak: newStreak,
          longestStreak: Math.max(h.longestStreak, newStreak),
          lastCompleted: new Date().toISOString(),
          completedDates: [...h.completedDates, today],
        };
      }),
    }));
  },

  addHabit: (habit) => {
    const newHabit: HabitItem = {
      ...habit,
      id: `habit_${Date.now()}`,
      streak: 0,
      longestStreak: 0,
      completedDates: [],
    };
    set((state) => ({ habits: [...state.habits, newHabit] }));
  },

  isHabitCompletedToday: (id) => {
    const today = new Date().toDateString();
    const habit = get().habits.find((h) => h.id === id);
    return habit?.completedDates.includes(today) ?? false;
  },
}));
