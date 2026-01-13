import { AutomationData } from "@/lib/automations";

export interface AutomationPageProps {
  automation: AutomationData;
  executing: boolean;
  onExecute: (
    automationId: string,
    params?: {
      clientId?: string;
      monthId?: string;
      clientName?: string;
      monthName?: string;
      quantidadeDePost?: string;
    }
  ) => Promise<void>;
  icon: React.ReactNode;
}
