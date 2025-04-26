import { Suspense } from "react";
import LoginPage from "./login/page";

export default function Home() {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <LoginPage />
      </Suspense>
    </div>
  );
}
