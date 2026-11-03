import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AlbumDetail } from "@/components/AlbumDetail";
import { Screen } from "@/components/Screen";
import { albums } from "@/data/content";

// Static export: one page per album, nothing else.
export const dynamicParams = false;

export function generateStaticParams() {
  return albums.map((a) => ({ album: a.id }));
}

export async function generateMetadata(props: PageProps<"/photos/[album]">): Promise<Metadata> {
  const { album } = await props.params;
  const a = albums.find((x) => x.id === album);
  return a ? { title: `${a.name} — Photos`, description: a.desc } : {};
}

export default async function AlbumPage(props: PageProps<"/photos/[album]">) {
  const { album } = await props.params;
  const a = albums.find((x) => x.id === album);
  if (!a) notFound();
  return (
    <Screen title={a.name} overlay>
      <AlbumDetail album={a} />
    </Screen>
  );
}
