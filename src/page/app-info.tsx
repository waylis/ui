import { Flex, Paper } from "@mantine/core";
import { MarkdownPreview } from "../components/markdown-preview";
import { useLighterSchemeColor } from "../hooks/useColors";
import { useConfigStore } from "../store/config";

export const AppInfo = () => {
  const bgColor = useLighterSchemeColor();
  const config = useConfigStore((s) => s.config);

  return (
    <Flex justify="center" align="center" p={8}>
      <Paper bg={bgColor} radius="md" p="md" maw={600}>
        <MarkdownPreview body={config.app.description || ""} />
      </Paper>
    </Flex>
  );
};
