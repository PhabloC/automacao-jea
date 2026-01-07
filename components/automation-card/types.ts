export interface AutomationCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  status: "active" | "inactive" | "error";
  lastRun?: string;
  onExecute?: () => void;
  isExecuting?: boolean;
}
