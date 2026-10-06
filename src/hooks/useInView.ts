import { useEffect, useState, type RefObject } from "react";

type InViewOptions = {
  once?: boolean;
  rootMargin?: string;
};

export function useInView(
  ref: RefObject<Element | null>,
  { once = true, rootMargin = "0px 0px -10% 0px" }: InViewOptions = {},
) {
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
        if (entry.isIntersecting && once) observer.disconnect();
      },
      { rootMargin },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, once, rootMargin]);

  return isInView;
}
