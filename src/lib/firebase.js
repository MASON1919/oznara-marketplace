
// Firebase SDK에서 필요한 함수들을 import 합니다.
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Firestore 데이터베이스 서비스를 사용하기 위해 import 합니다.

// .env.local 파일에 정의된 환경 변수에서 Firebase 설정 정보를 가져옵니다.
// NEXT_PUBLIC_ 접두사는 클라이언트 측 코드에서도 이 변수들에 접근할 수 있도록 합니다.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Firebase 앱을 초기화합니다.
// 이미 초기화된 앱이 있다면 해당 앱을 사용하고, 없다면 새로 초기화합니다.
// 이는 Next.js의 개발 모드에서 핫 리로딩 시 앱이 중복 초기화되는 것을 방지합니다.
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// 초기화된 Firebase 앱에서 Firestore 데이터베이스 인스턴스를 가져옵니다.
const db = getFirestore(app);

// 다른 파일에서 Firebase 앱과 Firestore 데이터베이스 인스턴스를 사용할 수 있도록 export 합니다.
export { app, db };
