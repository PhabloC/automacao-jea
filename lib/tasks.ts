// Interface para posts do calendário (armazenados na tarefa)
export interface TaskPost {
  id: string;
  titulo: string;
  formato: string;
  canais: string;
  dataPublicacao: string;
  descricao: string;
  referencia: string;
}

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
  posts?: TaskPost[];
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

// Atualizar uma tarefa (ex.: posts)
export function updateTask(
  taskId: string,
  payload: { posts: TaskPost[]; postsCount: number }
): void {
  if (typeof window === "undefined") return;

  const tasks = getTasks();
  const updatedTasks = tasks.map((task) =>
    task.id === taskId
      ? { ...task, posts: payload.posts, postsCount: payload.postsCount }
      : task
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTasks));
}

// Deletar uma tarefa específica
export function deleteTask(taskId: string): void {
  if (typeof window === "undefined") return;

  const tasks = getTasks();
  const updatedTasks = tasks.filter((task) => task.id !== taskId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTasks));
}

// Limpar todas as tarefas (útil para testes)
export function clearTasks(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

// --- API Supabase (produção) ---

const TASKS_API = "/api/tasks";

export async function fetchTasksFromApi(accessToken: string): Promise<Task[]> {
  const res = await fetch(TASKS_API, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Erro ao buscar tarefas");
  }

  const { tasks } = await res.json();
  return Array.isArray(tasks) ? tasks : [];
}

export async function saveTaskToApi(
  accessToken: string,
  task: Omit<Task, "id" | "createdAt">
): Promise<{ id: string; createdAt: string } | null> {
  const res = await fetch(TASKS_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(task),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    console.error("[tasks] Erro ao salvar tarefa na API:", data.error);
    return null;
  }

  const data = await res.json();
  return { id: data.id, createdAt: data.createdAt };
}

export async function updateTaskInApi(
  accessToken: string,
  taskId: string,
  payload: { posts: TaskPost[]; postsCount: number }
): Promise<boolean> {
  const res = await fetch(TASKS_API, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      id: taskId,
      posts: payload.posts,
      postsCount: payload.postsCount,
    }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    console.error("[tasks] Erro ao atualizar tarefa na API:", data.error);
    return false;
  }

  return true;
}

export async function deleteTaskFromApi(
  accessToken: string,
  taskId: string
): Promise<boolean> {
  const res = await fetch(`${TASKS_API}?id=${encodeURIComponent(taskId)}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    console.error("[tasks] Erro ao excluir tarefa na API:", data.error);
    return false;
  }

  return true;
}
