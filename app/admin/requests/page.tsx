import { Suspense } from "react";
import RequestsContent from "./requests-content";

export default function CustomerRequestsPage() {
  return (
    <Suspense fallback={<main style={{ padding: 40 }}>Talepler yükleniyor...</main>}>
      <RequestsContent />
    </Suspense>
  );
}
