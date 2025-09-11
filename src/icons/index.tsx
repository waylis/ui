import type { SVGProps } from "react";

export function IconDots(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="2em" height="2em" {...props}>
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 1 1-2 0a1 1 0 0 1 2 0m7 0a1 1 0 1 1-2 0a1 1 0 0 1 2 0m7 0a1 1 0 1 1-2 0a1 1 0 0 1 2 0"
      ></path>
    </svg>
  );
}
