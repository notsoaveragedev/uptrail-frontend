import { useEffect, useState } from "react";

export function useRotation(ids: string[], everySec: number) {
  const [rotation, setRotation] = useState(() => ({ index: 0, rotatedAt: Date.now() }));

  useEffect(() => {
    if (ids.length < 2) return;
    const timer = setInterval(
      () => setRotation((current) => ({ index: (current.index + 1) % ids.length, rotatedAt: Date.now() })),
      everySec * 1000,
    );
    return () => clearInterval(timer);
  }, [ids.length, everySec]);

  return { activeId: ids[rotation.index % ids.length], rotatedAt: rotation.rotatedAt };
}
