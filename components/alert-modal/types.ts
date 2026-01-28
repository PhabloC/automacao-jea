import { AlertModalType } from "./AlertModal";

export interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  message: string;
  type?: AlertModalType;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
}
