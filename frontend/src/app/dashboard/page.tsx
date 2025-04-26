import { Suspense } from "react";
import Dashboard from "./dashboard";

export default function DashboardPage() {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <Dashboard />
      </Suspense>
    </div>
  );
}
