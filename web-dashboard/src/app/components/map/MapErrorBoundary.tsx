// 1. Imports
import { Component, type ErrorInfo, type ReactNode } from "react";
import { COLORS } from "../../../constants/theme";

// 2. Interfaces
interface Props {
  children:  ReactNode;
  onReset:   () => void;
}

interface State {
  hasError: boolean;
  message:  string;
}

// 3. Component
/**
 * React class error boundary for the Leaflet map container.
 * Function components cannot catch render-phase errors, so we need a class.
 * Resets by calling the parent-provided `onReset` and resetting internal state.
 */
export class MapErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[MapErrorBoundary] Caught render error:", error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, message: "" });
    this.props.onReset();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div style={styles.wrapper}>
        <p style={styles.code}>Render error: {this.state.message}</p>
        <button style={styles.btn} onClick={this.handleReset}>
          Retry
        </button>
      </div>
    );
  }
}

// 4. Styles
const styles = {
  wrapper: {
    display:        "flex",
    flexDirection:  "column" as const,
    alignItems:     "center",
    justifyContent: "center",
    width:          "100%",
    height:         "100%",
    background:     COLORS.background,
    gap:            16,
  },
  code: {
    fontSize:    13,
    color:       COLORS.error,
    fontFamily:  "monospace",
  },
  btn: {
    padding:      "8px 20px",
    borderRadius: 8,
    border:       "none",
    background:   COLORS.secondary,
    color:        COLORS.white,
    cursor:       "pointer",
    fontWeight:   500,
  },
} as const;
