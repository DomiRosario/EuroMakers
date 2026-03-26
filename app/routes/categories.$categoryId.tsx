import { redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { CATEGORIES } from "~/lib/categories";

export async function loader({ params }: LoaderFunctionArgs) {
  const categoryId = params.categoryId;
  const categoryExists = categoryId
    ? CATEGORIES.some((category) => category.id === categoryId)
    : false;

  if (!categoryExists) {
    return redirect("/software");
  }

  return redirect(`/software?category=${categoryId}`);
}
