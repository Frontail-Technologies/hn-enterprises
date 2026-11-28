import { redirect } from "next/navigation";

/** Reports = the customer forms (work, billing and stock figures live on their own pages). */
export default function Page() {
  redirect("/reports/templates");
}
