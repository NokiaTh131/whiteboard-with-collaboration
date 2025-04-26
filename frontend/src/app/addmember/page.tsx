// app/addmember/page.tsx
import { Suspense } from "react";
import AddMemberForm from "./addmember";

export default function AddMemberPage() {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <AddMemberForm />
      </Suspense>
    </div>
  );
}
