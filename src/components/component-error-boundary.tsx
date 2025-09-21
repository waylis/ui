import { Component, type ErrorInfo, type ReactNode } from "react";
import { Paper, Title, Text, Button, Group, Stack } from "@mantine/core";

interface Props {
  children?: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ComponentErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Component error caught:", error, errorInfo);
  }

  private reset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <Paper radius="md" p="lg" withBorder>
          <Stack align="center" gap="sm">
            <Title order={4} c="red">
              {this.props.fallbackTitle || "Component render failed"}
            </Title>
            {this.state.error && (
              <Text size="sm" c="dimmed" ta="center">
                {this.state.error.message}
              </Text>
            )}
            <Group>
              <Button size="xs" variant="light" color="dimmed" onClick={this.reset}>
                Try rerender
              </Button>
            </Group>
          </Stack>
        </Paper>
      );
    }

    return this.props.children;
  }
}

export default ComponentErrorBoundary;
