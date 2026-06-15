import { HrSubNav } from "./HrSubNav";

export function HrLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <HrSubNav />
      {children}
    </>
  );
}
