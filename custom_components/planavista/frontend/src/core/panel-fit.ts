/**
 * Home Assistant's view container is at least 100vh tall, and in Safari 100vh
 * is the screen with its toolbars hidden. With them shown, the page scrolled
 * by their height under a card that fit (about 108 px on an iPhone 17 Pro Max).
 * A panel view's one card owns the whole view, so while it is there the view
 * is only as tall as the screen as shown, and the page never scrolls.
 */
export const SCREEN_AS_SHOWN = '100dvh';

interface ComposedNode {
  tagName?: string;
  parentNode: ComposedNode | null;
  /** A shadow root's host. */
  host?: ComposedNode;
}

/** The nearest ancestor with this tag, stepping out of shadow roots to their hosts. */
export function composedAncestor<T>(start: ComposedNode, tagName: string): T | null {
  let node: ComposedNode | null | undefined = start.parentNode ?? start.host;
  while (node) {
    if (node.tagName === tagName) return node as unknown as T;
    node = node.parentNode ?? node.host;
  }
  return null;
}

/**
 * Sets the container's minimum height to the screen as shown, where the
 * browser knows dvh, and returns what puts it back. A change someone else
 * made meanwhile is left alone.
 */
export function fitView(container: { style: { minHeight: string } }, supported: boolean): () => void {
  if (!supported) return () => {};
  const before = container.style.minHeight;
  container.style.minHeight = SCREEN_AS_SHOWN;
  return () => {
    if (container.style.minHeight === SCREEN_AS_SHOWN) container.style.minHeight = before;
  };
}
