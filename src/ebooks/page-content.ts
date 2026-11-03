import type { EbookPageContent } from "./types";


/** Stable keys for local image uploads, including the editable sample list. */
export function pageImagePath(key: string): ["content", "samples", number, "imageUrl"] | ["content", "bannerDesktopUrl" | "bannerMobileUrl" | "socialImageUrl" | "coverUrl"] {
  const sample = /^samples\.(\d+)\.imageUrl$/.exec(key);
  if (sample) return ["content", "samples", Number(sample[1]), "imageUrl"];
  if (key === "bannerDesktopUrl" || key === "bannerMobileUrl" || key === "socialImageUrl" || key === "coverUrl") return ["content", key];
  throw new Error("Campo de imagem desconhecido.");
}

export function withPageImages(content: EbookPageContent, images: Partial<Record<string, string>>): EbookPageContent {
  const next = { ...content, samples: content.samples?.map((sample) => ({ ...sample })) };
  for (const [key, url] of Object.entries(images)) {
    if (url === undefined) continue;
    const sample = /^samples\.(\d+)\.imageUrl$/.exec(key);
    if (sample) {
      const item = next.samples?.[Number(sample[1])];
      if (item) item.imageUrl = url;
    } else if (key === "bannerDesktopUrl" || key === "bannerMobileUrl" || key === "socialImageUrl" || key === "coverUrl") {
      next[key] = url;
    }
  }
  return next;
}

export function withoutSampleImage<T>(images: Record<string, T>, index: number): Record<string, T> {
  const next: Record<string, T> = {};
  for (const [key, value] of Object.entries(images)) {
    const sample = /^samples\.(\d+)\.imageUrl$/.exec(key);
    if (!sample) next[key] = value;
    else if (Number(sample[1]) !== index) next[`samples.${Number(sample[1]) > index ? Number(sample[1]) - 1 : Number(sample[1])}.imageUrl`] = value;
  }
  return next;
}
