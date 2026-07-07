import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getPageBySlug } from "@/lib/contentful/contentfulAdapter";
import { StoreProvider } from "@/store/StoreProvider";
import { StudioEditor } from "./components/StudioEditor";

type StudioPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function StudioPage({ params }: StudioPageProps) {
  const { slug } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/login?redirectTo=/studio/${slug}`);
  }

  if (user.role === "viewer") {
    redirect("/preview/home");
  }

  const pageResult = await getStudioPage(slug);

  if (!pageResult.page) {
    return (
      <main className="page-shell">
        <section className="section unsupported-section" role="alert">
          <div className="section-inner">
            <p className="eyebrow">Studio error</p>
            <h1>Contentful page could not load</h1>
            <p>{pageResult.error}</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <StoreProvider>
      <StudioEditor initialPage={pageResult.page} userRole={user.role} />
    </StoreProvider>
  );
}

async function getStudioPage(slug: string) {
  try {
    return {
      page: await getPageBySlug(slug),
      error: null,
    };
  } catch (error) {
    return {
      page: null,
      error: error instanceof Error ? error.message : "Unknown studio error.",
    };
  }
}
