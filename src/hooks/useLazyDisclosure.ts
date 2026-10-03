import { useState } from "react";

export function useLazyDisclosure() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);

  function open() {
    setHasOpened(true);
    setIsOpen(true);
  }

  function toggle() {
    setHasOpened(true);
    setIsOpen((current) => !current);
  }

  return { isOpen, hasOpened, open, toggle, close: () => setIsOpen(false) };
}
