import * as RadixVisuallyHidden from "@radix-ui/react-visually-hidden";
import { ReactNode } from "react";

export const VisuallyHidden = ({ children }: { children: ReactNode }) => (
  <RadixVisuallyHidden.Root>{children}</RadixVisuallyHidden.Root>
);
