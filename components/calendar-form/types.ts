export interface Post {
  id: string;
  titulo: string;
  formato: string;
  descricao: string;
  referencia: string;
}

export interface CalendarFormProps {
  onExecute: (
    clientId: string,
    monthId: string,
    clientName: string,
    monthName: string,
    posts: Post[]
  ) => Promise<void>;
  isExecuting: boolean;
}
