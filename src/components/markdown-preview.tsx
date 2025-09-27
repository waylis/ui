import { type FC } from "react";
import { Code, Flex, Text } from "@mantine/core";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CustomCopyButton } from "../components/custom-copy-button";

export const MarkdownPreview: FC<{ body: string }> = ({ body }) => {
  return (
    <Markdown
      components={{
        code: (props) => {
          const { children } = props;
          const code = children?.toString() || "";
          const lines = code.split("\n").length - 1;
          const symbols = code.length;
          return (
            <>
              <Code block>{children}</Code>
              <Flex justify="flex-end" gap="sm" align="center">
                <Text lh={0} p={0} size="xs" opacity={0.7}>
                  {`lines: ${lines}`}
                </Text>
                <Text lh={0} p={0} size="xs" opacity={0.7}>
                  {`symbols: ${symbols}`}
                </Text>
                <CustomCopyButton value={children?.toString() || ""} />
              </Flex>
            </>
          );
        },

        img: ({ node, ...props }) => {
          return (
            <img
              {...props}
              style={{
                maxWidth: "100%",
                height: "auto",
                maxHeight: "75vh",
                borderRadius: "0.25rem",
                margin: 0,
                padding: 0,
              }}
              alt={props.alt || "Image"}
              loading="lazy"
            />
          );
        },
      }}
      remarkPlugins={[remarkGfm]}
    >
      {body}
    </Markdown>
  );
};
