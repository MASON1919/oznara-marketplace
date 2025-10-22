// /src/components/product/ProductList.js

// 이 파일은 검색된 상품들을 목록 형태로 보여주는 컴포넌트입니다.
// 여러 개의 상품 카드(ProductCard)를 한 줄씩 나열하여 보여줍니다.

// 개별 상품 하나를 보여주는 ProductCard 컴по넌트를 가져옵니다.
import ProductCard from './ProductCard';

// ProductList 컴포넌트는 'results'라는 정보를 부모 컴포넌트로부터 받습니다.
// - results: 검색된 상품들의 목록(배열)
export default function ProductList({ results }) {
  return (
    // 상품 카드들을 감싸는 영역입니다.
    // 'space-y-4'는 Tailwind CSS 클래스로, 자식 요소들 사이에 세로 간격을 줍니다. (4 = 1rem = 16px)
    <div className="space-y-4">
      {/*
        'results' 배열에 있는 각 상품(product)에 대해 ProductCard 컴포넌트를 하나씩 만듭니다.
        - map 함수: 배열의 각 항목을 순회하며, 각 항목에 대해 주어진 함수를 실행한 결과로 새로운 배열을 만듭니다.
                     여기서는 각 상품 데이터를 ProductCard 컴포넌트로 변환합니다.
        - key={product.id}: React가 목록의 각 항목을 효율적으로 구분하고 업데이트하기 위해 필요한 고유한 값입니다.
                           각 상품의 고유 ID(product.id)를 key로 사용합니다.
        - item={product}: 각 상품의 모든 정보를 ProductCard 컴포넌트에 'item'이라는 이름의 prop으로 전달합니다.
      */}
      {results.map(product => (
        <ProductCard key={product.id} item={product} />
      ))}
    </div>
  );
}