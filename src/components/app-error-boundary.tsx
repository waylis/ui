import { Component, type ErrorInfo, type ReactNode } from "react";
import { Container, Paper, Title, Text, Button, Group, ScrollArea, Stack } from "@mantine/core";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class AppErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <Container size="sm" style={{ display: "flex", alignItems: "center", height: "100vh" }}>
          <Paper shadow="lg" radius="md" py="lg" px="md" withBorder style={{ width: "100%" }}>
            <Stack align="center" gap="md">
              <Title order={2} ta="center" c="red">
                Something went wrong
              </Title>
              {this.state.error && (
                <Text ta="center" c="dimmed">
                  {this.state.error.message}
                </Text>
              )}
              {this.state.errorInfo?.componentStack && (
                <ScrollArea h={200} w="100%" type="auto" offsetScrollbars>
                  <Text size="xs" c="dimmed" ff="monospace">
                    {this.state.errorInfo.componentStack}
                  </Text>
                </ScrollArea>
              )}

              <Group justify="center" mt="md">
                <Button variant="filled" color="red" onClick={this.handleReload}>
                  Reload Page
                </Button>
              </Group>
            </Stack>
          </Paper>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;
