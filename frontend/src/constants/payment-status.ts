/**
 * @deprecated Gunakan payment-workflow.ts — tahap alur pembayaran.
 * Dipertahankan untuk kompatibilitas import lama.
 */
export {
  PAYMENT_WORKFLOW_STAGES as PAYMENT_STATUSES,
  getPaymentWorkflowStage as getPaymentStatus,
  resolvePaymentWorkflowStageId as resolvePaymentStatusId,
  type PaymentWorkflowStageId as PaymentStatusId,
  type PaymentWorkflowStage as PaymentStatus,
} from "./payment-workflow";
