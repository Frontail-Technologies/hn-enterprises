import { redirect } from "next/navigation";

interface GcUploadReviewRedirectPageProps {
  params: Promise<{ id: string }>;
}

export default async function GcUploadReviewRedirectPage({
  params,
}: GcUploadReviewRedirectPageProps) {
  const { id } = await params;
  redirect(`/gc-uploads/${id}`);
}
