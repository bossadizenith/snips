declare module "*.svg" {
  import React from "react";
  const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
  export default ReactComponent;
}

declare module "*.svg?url" {
  const content: string;
  export default content;
}

declare module "*.inline.png" {
  const content: string;
  export default content;
}

declare module "*.inline.jpg" {
  const content: string;
  export default content;
}

declare module "*.inline.gif" {
  const content: string;
  export default content;
}

interface StaticImageData {
  src: string;
  height: number;
  width: number;
  blurDataURL?: string;
  blurWidth?: number;
  blurHeight?: number;
}

declare module "*.png" {
  const content: StaticImageData;
  export default content;
}

declare module "*.jpg" {
  const content: StaticImageData;
  export default content;
}

declare module "*.jpeg" {
  const content: StaticImageData;
  export default content;
}

declare module "*.gif" {
  const content: StaticImageData;
  export default content;
}

declare module "*.webp" {
  const content: StaticImageData;
  export default content;
}

declare module "*.ico" {
  const content: StaticImageData;
  export default content;
}

declare module "*.bmp" {
  const content: StaticImageData;
  export default content;
}

declare module "lodash.debounce" {
  const debounce: any;
  export default debounce;
}
