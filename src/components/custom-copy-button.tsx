import { Button, CopyButton } from "@mantine/core";
import type { FC } from "react";

export const CustomCopyButton: FC<{ value: string }> = ({ value }) => {
  return (
    <CopyButton value={value} timeout={2000}>
      {({ copied, copy }) => (
        <Button
          size="compact-xs"
          opacity={copied ? 1 : 0.8}
          color={copied ? "teal" : "default"}
          variant="light"
          fw={300}
          onClick={copy}
          radius={0}
        >
          {copied ? "copied" : "copy"}
        </Button>
      )}
    </CopyButton>
  );
};
