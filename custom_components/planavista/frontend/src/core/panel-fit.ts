/**
 * Home Assistant sizes its page by 100vh (html { height: 100vh } and the view
 * container's min-height: 100vh), and in Safari 100vh is the screen with its
 * toolbars hidden. With them shown, the page scrolled by their height under a
 * card that fit: about 108 px on an iPhone 17 Pro Max, and about 79 px on an
 * iPad, whose Safari never hides them. A panel view's one card owns the whole
 * page, so while it is there both are only as tall as the screen as shown,
 * and the page never scrolls.
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
 * Sets the element's height or minimum height to the screen as shown, where
 * the browser knows dvh, and returns what puts it back. A change someone else
 * made meanwhile is left alone.
 */
export function fitView(
  element: { style: { minHeight: string; height: string } },
  property: 'minHeight' | 'height',
  supported: boolean,
): () => void {
  if (!supported) return () => {};
  const before = element.style[property];
  element.style[property] = SCREEN_AS_SHOWN;
  return () => {
    if (element.style[property] === SCREEN_AS_SHOWN) element.style[property] = before;
  };
}
