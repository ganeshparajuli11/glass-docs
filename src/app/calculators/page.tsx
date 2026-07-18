import { CategoryLanding, categoryMetadata } from "@/components/tool/CategoryLanding";
import { categoryPages } from "@/lib/seo/categories";

const page = categoryPages.find((p) => p.category === "calculator")!;

export const metadata = categoryMetadata(page);

export default function Page() {
  return <CategoryLanding page={page} />;
}
