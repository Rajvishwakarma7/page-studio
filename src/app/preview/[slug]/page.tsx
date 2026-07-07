import { getPageBySlug } from "@/lib/contentful/contentfulAdapter";
import { PreviewRenderer } from "./components/PreviewRenderer";

type PreviewPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    draft?: string;
  }>;
};

export default async function PreviewPage({
  params,
  searchParams,
}: PreviewPageProps) {
  const { slug } = await params;
  const { draft } = await searchParams;
  const pageResult = await getPreviewPage(slug, draft === "contentful");

  if (!pageResult.page) {
    return (
      <main className="page-shell">
        <section className="section unsupported-section" role="alert">
          <div className="section-inner">
            <p className="eyebrow">Preview error</p>
            <h1>Contentful page could not render</h1>
            <p>{pageResult.error}</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <PreviewRenderer
      publishedPage={pageResult.page}
      useLocalDraft={draft === "local"}
    />
  );
}

async function getPreviewPage(slug: string, preview: boolean) {
  try {
    return {
      page: await getPageBySlug(slug, { preview }),
      error: null,
    };
  } catch (error) {
    return {
      page: null,
      error: error instanceof Error ? error.message : "Unknown preview error.",
    };
  }
}
