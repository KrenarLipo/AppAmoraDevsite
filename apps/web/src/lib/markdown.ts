import { Marked } from "marked";

// Posts are written in the admin, so raw HTML in the markdown is dropped:
// only markdown formatting reaches the page. Used on the server and in the editor preview.
const markdown = new Marked({
  gfm: true,
  renderer: {
    html: () => "",
  },
});

export function renderMarkdown(source: string): string {
  return markdown.parse(source, { async: false });
}

export function readingMinutes(source: string): number {
  return Math.max(1, Math.round(source.trim().split(/\s+/).length / 200));
}
