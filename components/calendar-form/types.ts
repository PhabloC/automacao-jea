import { Post } from "../post-modal/types";

export type { Post };

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
