import { refProps } from "@/app/api/shorten-url/route";
import { toast } from "@/components/ui/toast";
import { siteConfig } from "@/lib/site";

export async function shortenUrl(url: string, ref: refProps) {
  const response = await fetch(
    `${siteConfig.url}/api/shorten-url?url=${encodeURIComponent(url)}&ref=${ref}`,
  ).then((res) => res.json());

  if (response.link) {
    return response.link as string;
  }

  console.error("Failed to shorten URL", response);

  throw new Error("Unable to shorten this link");
}
