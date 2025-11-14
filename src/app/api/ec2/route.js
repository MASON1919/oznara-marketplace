import { NextResponse } from "next/server";
export async function POST(request) {
  const files = (await request.formData()).getAll("images");
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("images", file);
  });
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/upload/images`,
    {
      method: "POST",
      body: formData,
    }
  );
  if (!response.ok) {
    throw new Error("업로드 실패");
  }
  return NextResponse.json(await response.json());
}
