import { redirect } from "next/navigation";
import { isAdminSession } from "@/lib/admin-auth";
import AdminPanel from "./panel";

export default async function AdminPage() {
  if (!(await isAdminSession())) redirect("/admin/login");
  return <AdminPanel />;
}