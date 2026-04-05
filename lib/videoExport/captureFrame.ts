import * as htmlToImage from "html-to-image";

export async function captureElementAsCanvas(
  element: HTMLElement,
  width: number,
  height: number,
): Promise<HTMLCanvasElement> {
  return await htmlToImage.toCanvas(element, {
    width,
    height,
    pixelRatio: 1,
    fetchRequestInit: { cache: "force-cache" },
    filter: (node: Node) => {
      if (node instanceof HTMLElement) {
        return !node.hasAttribute("data-ignore-in-export");
      }
      return true;
    },
  });
}

export async function captureElementAsImageBitmap(
  element: HTMLElement,
  width: number,
  height: number,
): Promise<ImageBitmap> {
  const canvas = await captureElementAsCanvas(element, width, height);
  return createImageBitmap(canvas);
}
