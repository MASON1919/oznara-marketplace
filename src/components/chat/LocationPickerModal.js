
import { memo, useState, useEffect, useRef } from 'react';
import { useKakaoMapsScript } from '@/context/KakaoMapsScriptProvider';
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
  const { isLoaded } = useKakaoMapsScript();
  const mapRef = useRef(null); // useRef로 map 인스턴스 관리
  const markerRef = useRef(null); // useRef로 marker 인스턴스 관리
  const mapContainerRef = useRef(null); // 지도 컨테이너 DOM 요소를 위한 ref
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [shouldRenderMap, setShouldRenderMap] = useState(false); // 지도 렌더링 제어 상태

  // 모달이 닫힐 때 상태를 초기화하는 핸들러
  const handleOpenChange = (open) => {
    console.log('handleOpenChange called. open:', open);
    if (!open) {
      console.log('Modal is closing. Resetting map and states.');
      mapRef.current = null; // mapRef 초기화
      markerRef.current = null; // markerRef 초기화
      setSearchResults([]);
      setSearchKeyword("");
      setSelectedLocation(null);
      setShouldRenderMap(false); // 모달이 닫힐 때 지도 렌더링 상태 재설정
    }
    onClose(); // 원래의 onClose 핸들러 호출
  };

  // 모달이 열릴 때 지도를 렌더링할지 여부를 제어하는 useEffect
  useEffect(() => {
    if (isOpen) {
      // 모달이 완전히 열리고 안정화될 때까지 지도를 렌더링하는 것을 지연
      const timer = setTimeout(() => {
        setShouldRenderMap(true);
      }, 300); // 모달 전환 시간에 맞춰 지연 시간 조정
      return () => {
        clearTimeout(timer);
        setShouldRenderMap(false); // 모달이 닫힐 때 렌더링 상태 재설정
      };
    } else {
      setShouldRenderMap(false); // 모달이 닫힐 때 지도가 렌더링되지 않도록 보장
    }
  }, [isOpen]);

  useEffect(() => {
    console.log('useEffect for map init. isOpen:', isOpen, 'isLoaded:', isLoaded, 'mapRef.current:', mapRef.current, 'mapContainerRef.current (initial): ', mapContainerRef.current, 'shouldRenderMap:', shouldRenderMap);

    let observer = null;

    const initializeMap = () => {
      // Only initialize if map is not already initialized AND container has dimensions
      if (!mapRef.current && mapContainerRef.current && mapContainerRef.current.offsetWidth > 0 && mapContainerRef.current.offsetHeight > 0) {
        console.log('Map container dimensions are valid and map not initialized. Initializing map.');
        if (observer) observer.disconnect(); // Disconnect observer once map is initialized

        try {
          console.log('Attempting to create new Kakao Map instance.');
          const options = {
            center: new window.kakao.maps.LatLng(37.566826, 126.9786567),
            level: 3,
          };
          const newMap = new window.kakao.maps.Map(mapContainerRef.current, options);
          console.log('newMap instance created:', newMap);

          if (newMap) {
            mapRef.current = newMap;
            const newMarker = new window.kakao.maps.Marker();
            markerRef.current = newMarker;
            console.log('Map and Marker refs updated successfully.');

            newMap.relayout();
            newMap.setCenter(options.center);

            window.kakao.maps.event.addListener(mapRef.current, 'click', function (mouseEvent) {
              console.log('Map clicked event.');
              const latlng = mouseEvent.latLng;
              markerRef.current.setPosition(latlng);
              markerRef.current.setMap(mapRef.current);
              const geocoder = new window.kakao.maps.services.Geocoder();
              geocoder.coord2Address(latlng.getLng(), latlng.getLat(), (result, status) => {
                if (status === window.kakao.maps.services.Status.OK) {
                  const addressName = result[0].road_address
                    ? result[0].road_address.address_name
                    : result[0].address.address_name;
                  console.log('Geocoder success. Address:', addressName);
                  setSelectedLocation({
                    latitude: latlng.getLat(),
                    longitude: latlng.getLng(),
                    addressName: addressName,
                  });
                } else {
                  console.error('Geocoder failed. Status:', status);
                }
              });
            });
          } else {
            console.error('[Effect] new window.kakao.maps.Map() returned null or undefined.');
          }
        } catch (error) {
          console.error('[Effect] Error during map initialization:', error);
        }
      } else {
        console.log('Map not yet initialized or container dimensions not yet valid.');
      }
    };

    if (isOpen && isLoaded && shouldRenderMap && mapContainerRef.current) { // shouldRenderMap 조건 추가
      console.log('Conditions met for setting up ResizeObserver.');
      // Set up ResizeObserver
      observer = new ResizeObserver(initializeMap);
      observer.observe(mapContainerRef.current);

      // Initial check in case container already has dimensions
      initializeMap();
    }

    return () => {
      if (observer) observer.disconnect();
    };
  }, [isOpen, isLoaded, shouldRenderMap, mapContainerRef.current]); // shouldRenderMap을 의존성 배열에 추가

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchKeyword.trim()) return;
    console.log('handleSearch called. Keyword:', searchKeyword);
    const ps = new window.kakao.maps.services.Places();
    ps.keywordSearch(searchKeyword, (data, status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        console.log('Keyword search success. Results:', data);
        setSearchResults(data);
      } else {
        console.error('[Search Failed] Status:', status);
        alert('검색 결과가 없습니다.');
      }
    });
  };

  const handleResultClick = (place) => {
    console.log('handleResultClick called. mapRef.current:', mapRef.current);
    if (!mapRef.current) { // mapRef.current로 변경
      console.error('Cannot handle result click because map is not initialized.');
      return;
    }
    console.log('Map is initialized. Proceeding with result click.');
    const latlng = new window.kakao.maps.LatLng(place.y, place.x);
    mapRef.current.panTo(latlng); // mapRef.current로 변경
    markerRef.current.setPosition(latlng); // markerRef.current로 변경
    markerRef.current.setMap(mapRef.current); // markerRef.current, mapRef.current로 변경
    setSelectedLocation({
      latitude: parseFloat(place.y),
      longitude: parseFloat(place.x),
      addressName: place.place_name
    });
    setSearchResults([]);
  };

  const handleSend = () => {
    console.log('handleSend called. selectedLocation:', selectedLocation);
    if (selectedLocation) {
      onSendLocation(selectedLocation);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}> {/* onOpenChange 핸들러 변경 */}
      <DialogContent className="sm:max-w-[500px] min-h-[350px]"> {/* max-w 및 min-h 조정 */}
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
          />
          <Button type="submit">검색</Button>
        </form>

        <div className="relative">
          {shouldRenderMap && (
            <div ref={mapContainerRef} id="map" style={{ width: '100%', height: '300px' }}></div>
          )} {/* shouldRenderMap에 따라 조건부 렌더링 */}
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
            <Button type="button" variant="secondary" onClick={onClose}>
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
