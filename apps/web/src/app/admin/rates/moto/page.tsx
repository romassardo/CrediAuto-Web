import { redirect } from "next/navigation";

export default function MotoRatesPage() {
  // Redirigimos a la sección unificada de tasas AUTO
  redirect("/admin/rates/auto");
}
