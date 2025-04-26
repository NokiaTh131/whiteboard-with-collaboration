import { Suspense } from "react";
import CreateBoardPage from "./create-board";

export default function AddMemberPage() {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <CreateBoardPage />
      </Suspense>
    </div>
  );
}
