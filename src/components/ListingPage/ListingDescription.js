import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ListingDescription({ description }) {
  return (
    <Card className="w-full mt-8">
      <CardHeader>
        <CardTitle>상품 설명</CardTitle>
      </CardHeader>
      <CardContent>{description}</CardContent>
    </Card>
  );
}
