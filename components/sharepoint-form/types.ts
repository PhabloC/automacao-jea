export interface SharePointFormProps {
  onExecute: (
    clientId: string,
    monthId: string,
    clientName: string,
    monthName: string,
    quantidadeDePost: string
  ) => Promise<void>;
  isExecuting: boolean;
}
