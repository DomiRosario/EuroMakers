import { json, type MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import type { Software } from "~/lib/software";
import Layout from "~/components/Layout";
import { getSoftwareByCategory } from "~/lib/software";
import { handleAPIError } from "~/lib/api/server";
import SoftwareGrid from "~/components/SoftwareGrid";
import { CATEGORIES } from "~/lib/categories";
import { buildSocialMeta } from "~/lib/meta";

interface LoaderData {
  software: Software[];
  category: string;
}

export async function loader({ params }: { params: { categoryId: string } }) {
  try {
    const category = CATEGORIES.find((c) => c.id === params.categoryId);
    if (!category) {
      throw new Error("Category not found");
    }

    const software = await getSoftwareByCategory(params.categoryId);
    return json<LoaderData>({ software, category: category.name });
  } catch (error) {
    return handleAPIError(error);
  }
}

export const meta: MetaFunction = ({ data, params }) => {
  const loaderData = data as LoaderData | undefined;
  const categoryName = loaderData?.category || "Category";
  const categoryPath = params.categoryId ? `/categories/${params.categoryId}` : "/software";

  return buildSocialMeta({
    title: `${categoryName} Software Made in Europe | EuroMakers`,
    description: `Discover ${categoryName.toLowerCase()} software built in Europe and curated by EuroMakers.`,
    path: categoryPath,
  });
};

export default function CategoryPage() {
  const { software, category } = useLoaderData<LoaderData>();

  return (
    <Layout>
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">{category} Software</h1>
          <SoftwareGrid software={software} />
        </div>
      </main>
    </Layout>
  );
}
