import { redirect } from "next/navigation";

export default function FinancePaymentRequestRedirectPage() {
  redirect("/finance/payments/alur-pembayaran?tab=permintaan");
}
