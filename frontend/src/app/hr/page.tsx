import { HrDashboard } from "@/components/hr/HrDashboard";
import { Suspense } from "react";

export default function HrPage() {
  return (
    <Suspense>
      <HrDashboard />
    </Suspense>
  );
}
