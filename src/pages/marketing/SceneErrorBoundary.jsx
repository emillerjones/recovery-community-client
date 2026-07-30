import { Component } from "react";

// Keeps a broken 3D scene from taking the rest of the page down with it.
export class SceneErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error) {
    console.error(`${this.props.label || "3D scene"} failed to render:`, error);
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
