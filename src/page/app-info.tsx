import { Flex, Paper } from "@mantine/core";
import { MarkdownPreview } from "../components/markdown-preview";
import { useLighterSchemeColor } from "../hooks/useColors";
import { useInfoStore } from "../store/info";

export const AppInfo = () => {
  const bgColor = useLighterSchemeColor();
  const info = useInfoStore((s) => s.info);

  return (
    <Flex justify="center" align="center" p={8}>
      <Paper bg={bgColor} radius="md" p="md" maw={600}>
        <MarkdownPreview body={info.description} />
      </Paper>
    </Flex>
  );
};
