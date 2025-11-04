'use client';

import { memo, useState, useEffect, useRef } from 'react';
import { useKakaoMapsScript } from '@/context/KakaoMapsScriptProvider'; // 검색 서비스 사용을 위해 isLoaded 확인
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const LocationPickerModal = ({ isOpen, onClose, onSendLocation }) => {
  const { isLoaded } = useKakaoMapsScript(); // Places 서비스가 로드되었는지 확인하기 위해 필요
  const iframeRef = useRef(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);

  // Iframe으로부터 메시지를 수신하는 useEffect
  useEffect(() => {
    const handleMessage = (event) => {
      
      if (event.data && event.data.type === 'LOCATION_SELECTED') {
        setSelectedLocation(event.data.payload);
      }
    };

    window.addEventListener('message', handleMessage);

    // 클린업 함수
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchKeyword.trim() || !isLoaded || !window.kakao) return;
    
    const ps = new window.kakao.maps.services.Places();
    ps.keywordSearch(searchKeyword, (data, status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        setSearchResults(data);
      } else {
        alert('검색 결과가 없습니다.');
      }
    });
  };

  const handleResultClick = (place) => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      // Iframe으로 위치 이동 메시지만 보냅니다.
      iframeRef.current.contentWindow.postMessage({
        type: 'PAN_TO',
        payload: { lat: place.y, lng: place.x }
      }, '*');
    }
    setSearchResults([]);
  };

  const handleSend = () => {
    if (selectedLocation) {
      onSendLocation(selectedLocation);
      handleClose();
    }
  };

  const handleClose = () => {
    setSearchKeyword("");
    setSearchResults([]);
    setSelectedLocation(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[500px] min-h-[350px]">
        <DialogHeader>
          <DialogTitle>장소 선택</DialogTitle>
          <DialogDescription>
            약속 장소를 검색하거나 지도에서 직접 선택하세요.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSearch} className="flex w-full items-center space-x-2">
          <Input
            type="text"
            placeholder="장소, 주소 검색"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            disabled={!isLoaded}
          />
          <Button type="submit" disabled={!isLoaded}>검색</Button>
        </form>

        <div className="relative w-full h-[300px] border rounded-md">
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

        <DialogFooter className="sm:justify-between">
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

export default memo(LocationPickerModal);
