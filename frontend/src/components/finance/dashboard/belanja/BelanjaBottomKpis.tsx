import { BELANJA_BOTTOM_KPIS } from "@/constants/belanja-data";
import { cardClassName } from "@/components/ui/Card";

export function BelanjaBottomKpis() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {BELANJA_BOTTOM_KPIS.map((kpi) => (
        <div key={kpi.label} className={cardClassName({ variant: "default" })}>
          <p className="text-xs font-medium text-slate-500">{kpi.label}</p>
          {"items" in kpi ? (
            <ul className="mt-2 space-y-1.5">
              {(kpi.items ?? []).map((item) => (
                <li key={item.name} className="flex justify-between text-xs">
                  <span className="text-slate-600">{item.name}</span>
                  <span className="font-semibold text-slate-800">{item.value}</span>
                </li>
              ))}
            </ul>
          ) : (
            <>
              <p className="mt-2 text-lg font-bold text-slate-900">{kpi.value}</p>
              <p className="mt-0.5 text-[0.625rem] text-slate-400">{kpi.sub}</p>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
