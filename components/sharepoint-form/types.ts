export interface SharePointFormProps {
  onExecute: (
    clientId: string,
    monthId: string,
    clientName: string,
    monthName: string
  ) => Promise<void>;
  isExecuting: boolean;
}
