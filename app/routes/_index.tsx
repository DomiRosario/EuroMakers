import { json, type MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { countSoftwareByCategoryServer } from "~/lib/software.server";
import Layout from "~/components/Layout";
import Hero from "~/components/Hero";
import {
  buildSocialMeta,
  DEFAULT_HOME_DESCRIPTION,
  DEFAULT_HOME_TITLE,
} from "~/lib/meta";

interface LoaderData {
  categoryCounts: Record<string, number>;
}

export async function loader() {
  const categoryCounts = await countSoftwareByCategoryServer();
  return json<LoaderData>({ categoryCounts });
}

export const meta: MetaFunction = () =>
  buildSocialMeta({
    title: DEFAULT_HOME_TITLE,
    description: DEFAULT_HOME_DESCRIPTION,
    path: "/",
  });

export default function Index() {
  const { categoryCounts } = useLoaderData<LoaderData>();

  return (
    <Layout>
      <main className="flex flex-1 flex-col">
        <Hero categoryCounts={categoryCounts} />
      </main>
    </Layout>
  );
}
