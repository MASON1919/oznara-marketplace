// 이 코드는 웹 브라우저(클라이언트)에서 실행됩니다.
'use client';

// React에서 필요한 기능들을 가져옵니다.
// `memo`: 화면을 더 빠르게 만들어주는 기능
// `useState`: 화면에서 변하는 값(상태)을 관리하는 기능
// `useEffect`: 화면이 처음 나타나거나 특정 상황이 바뀔 때 어떤 작업을 하는 기능
// `useRef`: 특정 HTML 요소를 직접 가리킬 때 사용하는 기능
import { memo, useState, useEffect, useRef } from 'react';

// 카카오맵 스크립트가 잘 로드되었는지 확인하는 도우미 훅을 가져옵니다.
import { useKakaoMapsScript } from '@/context/KakaoMapsScriptProvider';

// 미리 만들어둔 예쁜 팝업창(모달) 부품들을 가져옵니다.
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

// 미리 만들어둔 예쁜 버튼과 입력창 부품들을 가져옵니다.
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * 이 팝업창(모달)은 카카오맵을 이용해서 약속 장소를 검색하고 선택할 수 있게 해줍니다.
 * 
 * @param {object} props - 이 팝업창에 전달되는 정보들
 * @param {boolean} props.isOpen - 팝업창이 열려있는지 닫혀있는지 알려주는 변수
 * @param {Function} props.onClose - 팝업창을 닫을 때 실행되는 기능
 * @param {Function} props.onSendLocation - 선택한 위치 정보를 다른 곳으로 보낼 때 실행되는 기능
 */
const LocationPickerModal = ({ isOpen, onClose, onSendLocation }) => {
  // 1. 카카오맵 스크립트가 웹 페이지에 잘 로드되었는지 확인합니다.
  //    (이게 로드되어야 장소 검색 같은 카카오맵 기능을 쓸 수 있습니다.)
  const { isLoaded } = useKakaoMapsScript();
  // 2. 지도 화면이 들어갈 `iframe`이라는 HTML 요소를 직접 가리킬 때 사용합니다.
  const iframeRef = useRef(null);
  // 3. 장소를 검색할 때 입력하는 단어를 저장하는 변수입니다.
  const [searchKeyword, setSearchKeyword] = useState("");
  // 4. 장소 검색 결과 목록을 저장하는 변수입니다.
  const [searchResults, setSearchResults] = useState([]);
  // 5. 지도에서 최종적으로 선택된 위치 정보를 저장하는 변수입니다.
  const [selectedLocation, setSelectedLocation] = useState(null);

  // 이 부분은 팝업창이 처음 나타날 때 한 번만 실행됩니다.
  // `map.html`이라는 지도 화면에서 위치 정보를 보내주면, 그걸 받아서 처리하는 기능입니다.
  useEffect(() => {
    // 1. `map.html`에서 메시지를 보내면 이 `handleMessage` 기능이 실행됩니다.
    const handleMessage = (event) => {
      // 2. 메시지 내용 중에 `LOCATION_SELECTED`라는 정보가 있다면,
      if (event.data && event.data.type === 'LOCATION_SELECTED') {
        // 3. 그 위치 정보를 `selectedLocation` 변수에 저장합니다.
        setSelectedLocation(event.data.payload);
      }
    };

    // 4. 웹 페이지 전체에 "메시지가 오면 `handleMessage`를 실행해줘" 하고 알려줍니다.
    window.addEventListener('message', handleMessage);

    // 5. 이 팝업창이 사라질 때, 더 이상 메시지를 받지 않도록 설정을 해제합니다.
    //    (불필요하게 계속 메시지를 받는 것을 막기 위함입니다.)
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []); // 빈 배열 `[]`은 이 기능이 처음 한 번만 실행되게 합니다.

  /** 장소 검색 입력창에서 검색 버튼을 눌렀을 때 실행되는 기능입니다. */
  const handleSearch = (e) => {
    e.preventDefault(); // 검색 버튼을 눌러도 웹 페이지가 새로고침되지 않게 합니다.
    // 검색어가 비어있거나, 카카오맵이 아직 준비되지 않았다면 아무것도 하지 않습니다.
    if (!searchKeyword.trim() || !isLoaded || !window.kakao) return;
    
    // 카카오맵의 장소 검색 기능을 사용하기 위한 준비를 합니다.
    const ps = new window.kakao.maps.services.Places();
    // 입력한 검색어로 장소를 찾습니다.
    ps.keywordSearch(searchKeyword, (data, status) => {
      // 검색이 성공하면, 검색 결과를 화면에 보여주기 위해 `searchResults` 변수에 저장합니다.
      if (status === window.kakao.maps.services.Status.OK) {
        setSearchResults(data);
      } else {
        alert('검색 결과가 없습니다.');
        setSearchResults([]); // 검색 결과가 없으면 목록을 비웁니다.
      }
    });
  };

  /** 검색 결과 목록에서 특정 장소를 클릭했을 때 실행되는 기능입니다. */
  const handleResultClick = (place) => {
    // 지도 화면(`iframe`)이 준비되어 있다면,
    if (iframeRef.current && iframeRef.current.contentWindow) {
      // `map.html`에 "이 위치로 지도를 옮겨줘!" 하고 메시지를 보냅니다.
      iframeRef.current.contentWindow.postMessage({
        type: 'PAN_TO', // 메시지 종류: 지도를 이동시키라는 명령
        payload: { lat: place.y, lng: place.x } // 이동할 위치의 위도, 경도 정보
      }, '*'); // 모든 웹 페이지에게 메시지를 보냅니다.
    }
    // 검색 결과 목록은 더 이상 필요 없으니 화면에서 숨깁니다.
    setSearchResults([]);
  };

  /** '위치 전송' 버튼을 눌렀을 때 실행되는 기능입니다. */
  const handleSend = () => {
    // 만약 선택된 위치 정보가 있다면,
    if (selectedLocation) {
      onSendLocation(selectedLocation); // 그 위치 정보를 다른 곳으로 보냅니다.
      handleClose(); // 팝업창을 닫습니다.
    }
  };

  /** 팝업창을 닫을 때, 검색어, 검색 결과, 선택된 위치 정보를 모두 초기화하는 기능입니다. */
  const handleClose = () => {
    setSearchKeyword("");
    setSearchResults([]);
    setSelectedLocation(null);
    onClose(); // 팝업창을 닫으라는 명령을 내립니다.
  };

  // 화면에 보여줄 팝업창 내용입니다.
  return (
    // `Dialog`는 미리 만들어둔 예쁜 팝업창 부품입니다.
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[500px] min-h-[350px]">
        <DialogHeader>
          <DialogTitle>장소 선택</DialogTitle>
          <DialogDescription>
            약속 장소를 검색하거나 지도에서 직접 선택해 보세요.
          </DialogDescription>
        </DialogHeader>

        {/* 장소 검색을 위한 입력창과 버튼입니다. */}
        <form onSubmit={handleSearch} className="flex w-full items-center space-x-2">
          <Input
            type="text"
            placeholder="장소, 주소 검색"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            disabled={!isLoaded} // 카카오맵이 준비되지 않았다면 입력창을 누르지 못하게 합니다.
          />
          <Button type="submit" disabled={!isLoaded}>검색</Button>
        </form>

        {/* 카카오 지도가 나타날 영역입니다. */}
        <div className="relative w-full h-[300px] border rounded-md">
          {/* 팝업창이 열려있을 때만 지도를 불러와서, 불필요하게 지도를 미리 로드하는 것을 막습니다. */}
          {isOpen && (
              <iframe
                ref={iframeRef}
                src={`/map.html?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAPS_APP_KEY}`}
                width="100%"
                height="100%"
                style={{ border: 'none' }}
                title="Kakao Map"
              />
          )}
          {/* 장소 검색 결과가 있을 때만 목록을 보여줍니다. */}
          {searchResults.length > 0 && (
            <ul className="absolute top-0 left-0 w-full max-h-40 overflow-y-auto bg-white border rounded-md shadow-lg z-10">
              {searchResults.map((place) => (
                <li
                  key={place.id}
                  onClick={() => handleResultClick(place)}
                  className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                >
                  <div className="font-bold">{place.place_name}</div>
                  <div className="text-xs text-gray-500">{place.road_address_name || place.address_name}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 팝업창 하단 버튼 영역입니다. */}
        <DialogFooter className="sm:justify-between">
          {/* 선택된 위치의 주소를 보여줍니다. */}
          <div className="text-sm text-muted-foreground truncate">
            {selectedLocation ? `선택된 위치: ${selectedLocation.addressName}` : "지도에서 위치를 선택하세요."}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={handleClose}>
              취소
            </Button>
            <Button type="button" onClick={handleSend} disabled={!selectedLocation}>
              위치 전송
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// `memo`라는 기능을 사용해서 `LocationPickerModal` 컴포넌트를 감싸줍니다.
// 이렇게 하면, 이 팝업창을 사용하는 부모 컴포넌트가 바뀌더라도
// `isOpen`, `onClose`, `onSendLocation` 정보가 바뀌지 않았다면 `LocationPickerModal`은 다시 그려지지 않아서 화면이 더 빠르게 움직입니다.
export default memo(LocationPickerModal);
