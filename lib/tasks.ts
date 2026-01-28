// Interface para tarefas criadas
export interface Task {
  id: string;
  automationId: string;
  automationName: string;
  clientId: string;
  clientName: string;
  monthId?: string;
  monthName?: string;
  postsCount?: number;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  createdAt: string;
  success: boolean;
  message: string;
}

const STORAGE_KEY = "automation_tasks";

// Salvar uma nova tarefa
export function saveTask(task: Omit<Task, "id" | "createdAt">): Task {
  const tasks = getTasks();

  const newTask: Task = {
    ...task,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };

  const updatedTasks = [newTask, ...tasks]; // Adiciona no início
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTasks));

  return newTask;
}

// Obter todas as tarefas
export function getTasks(): Task[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Erro ao carregar tarefas:", error);
  }

  return [];
}

// Limpar todas as tarefas (útil para testes)
export function clearTasks(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
