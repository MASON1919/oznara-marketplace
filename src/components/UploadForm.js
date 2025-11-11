//추후 수정 사항 : 업로드 이미지 중복 방지, db 업로드 실패시에 업로드된 이미지 삭제(선택), 업로드 이미지가 0개여도 등록 가능하게

"use client";
import { useDropzone } from "react-dropzone";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
export default function UploadForm() {
  const maxFilesNum = 10;
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [method, setMethod] = useState("direct");
  const onDrop = useCallback((acceptedFiles) => {
    acceptedFiles.forEach((file) => {
      file.preview = URL.createObjectURL(file);
    });
    setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
  }, []);

  // useDropzone 훅 초기화
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/jpeg": [],
      "image/png": [],
      "image/webp": [],
      "image/jpg": [],
    }, // 이미지 파일만 허용
    onDropRejected: (rejections) => {
      rejections.some((r) => {
        return r.errors.some((e) => {
          if (e.code === "too-many-files") {
            alert("파일은 최대 10개까지만 업로드할 수 있습니다.");
            return true;
          } else if (e.code === "file-invalid-type") {
            alert("허용되지 않는 파일 형식입니다.");
            return true;
          } else if (e.code === "file-too-large") {
            alert("파일 크기가 너무 큽니다.");
            return true;
          }
          return false;
        });
      }); //어떤 이유로 거절되었는지 표시해주기
    },
    multiple: true,
    maxFiles: maxFilesNum - files.length, //남은 업로드 가능 파일 수
    maxSize: 5 * 1024 * 1024, //5MB
    onDrop,
  });
  const router = useRouter();
  const handleUpload = async () => {
    try {
      /*const promises = files.map(async (file) => {
        const response = await fetch("/api/upload/presigned", {
          method: "POST",
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.type,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Presigned URL 생성 실패");
        }

        const { url, key } = await response.json();

        const upload = await fetch(url, {
          method: "PUT",
          body: file,
          headers: {
            "Content-Type": file.type,
          },
        });

        if (!upload.ok) {
          throw new Error("S3 업로드 실패");
        }
        return key;
      });

      const keys = await Promise.all(promises);
      setFiles([]);
      return keys;*/
      //업로드용 서버로 변경
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

      const data = await response.json();
      setFiles([]);
      const keys = data.files.map((f) => f.key);
      return keys;
    } catch (error) {
      console.error("업로드 중 오류 발생 : ", error);
      return []; //업로드 실패 시 반환할 값
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    //클라이언트에서 폼 검증
    if (!title.trim()) return alert("상품명을 입력하세요.");
    if (!price || Number.isNaN(Number(price)))
      return alert("가격은 숫자만 입력 가능합니다.");
    if (!category) return alert("카테고리를 선택하십시오.");
    if (files.length === 0)
      return alert("상품 이미지는 최소 1장을 업로드하십시오.");

    try {
      setUploading(true);
      const filesInfo = files.map((file) => ({
        size: file.size,
        type: file.type,
      }));
      const uploadedKeys = await handleUpload();
      //업로드 실패하면 db 쓰기 하지 않음
      if (uploadedKeys === undefined || uploadedKeys.length === 0) {
        //추후 수정 필요(이미지가 없으면 기본이미지로 대체할 예정)
        throw new Error("이미지 업로드 실패");
      }

      // 업로드가 끝나면 서버에 상품 정보 저장
      const payload = {
        title: title.trim(),
        description: description.trim(),
        price: Number(price),
        category,
        method,
        imageKeys: uploadedKeys, // S3 key 배열
        filesInfo,
      };

      const res = await fetch("/api/listing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("상품 등록 실패");
      alert("상품이 등록되었습니다!");
      setFiles([]);
      router.push("/");
    } catch (err) {
      console.error(err);
      alert("업로드 중 오류 발생");
    } finally {
      setUploading(false);
    }
  };
  const removeFile = (fileName) => {
    setFiles((prev) => {
      const target = prev.find((f) => f.name === fileName);
      if (target?.preview) URL.revokeObjectURL(target.preview);
      return prev.filter((f) => !(f.name === fileName));
    });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>중고거래 상품 등록</CardTitle>
          <CardDescription>
            사진을 포함해 상품 정보를 입력하세요.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-2">
            <Label htmlFor="title">상품명</Label>
            <Input
              id="title"
              placeholder="예: 아이폰 13 미개봉"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="price">가격(원)</Label>
            <Input
              id="price"
              type="number"
              min={0}
              inputMode="numeric"
              placeholder="예: 550000"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label>카테고리</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="카테고리를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Electronics">디지털/가전</SelectItem>
                <SelectItem value="Furniture">가구/인테리어</SelectItem>
                <SelectItem value="Clothing">패션/잡화</SelectItem>
                <SelectItem value="Sports">스포츠/레저</SelectItem>
                <SelectItem value="Books">도서/취미/게임</SelectItem>
                <SelectItem value="Others">기타</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>거래방법</Label>
            <RadioGroup
              value={method}
              onValueChange={setMethod}
              className="grid grid-cols-3 gap-3 md:max-w-md"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem id="m-direct" value="Direct" />
                <Label htmlFor="m-direct">직거래</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem id="m-shipping" value="Delivery" />
                <Label htmlFor="m-shipping">택배</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem id="m-both" value="Both" />
                <Label htmlFor="m-both">둘 다</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="desc">상품 설명</Label>
            <Textarea
              id="desc"
              rows={6}
              placeholder="상태, 구성품, 하자 여부, 거래 가능 지역 등"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <Separator />

          <div className="grid gap-3">
            <Label>상품 이미지</Label>
            <div
              {...getRootProps({
                className:
                  "flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ",
              })}
            >
              <input {...getInputProps()} />
              <p className="text-sm text-muted-foreground">
                {isDragActive
                  ? "여기에 파일을 놓으세요"
                  : "클릭 또는 드래그하여 이미지를 선택 (최대 10장, JPG/PNG/WEBP)"}
              </p>
            </div>

            {files.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {files.map((file) => (
                  <div
                    key={file.name + file.size}
                    className="relative group border rounded-lg overflow-hidden"
                  >
                    <img
                      src={file.preview}
                      alt={file.name}
                      className="w-full h-32 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-end">
                      <div className="w-full flex justify-between items-center p-2 text-white text-xs">
                        <span className="truncate max-w-[70%]">
                          {file.name}
                        </span>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="h-6 px-2"
                          onClick={() => removeFile(file.name)}
                        >
                          삭제
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setTitle("");
              setPrice("");
              setDescription("");
              setCategory("");
              setMethod("direct");
              files.forEach((f) => f.preview && URL.revokeObjectURL(f.preview));
              setFiles([]);
            }}
          >
            초기화
          </Button>
          <Button type="submit" disabled={uploading}>
            등록하기
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
