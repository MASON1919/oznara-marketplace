// 이 파일은 서버 측 코드에서만 사용됩니다.

import admin from "firebase-admin";

// 이미 초기화된 앱이 있는지 확인하여 중복 초기화를 방지합니다.
// Next.js의 개발 환경에서는 코드가 변경될 때마다 파일이 다시 로드될 수 있기 때문입니다.
if (!admin.apps.length) {
  try {
    // 환경 변수에서 서비스 계정 정보를 가져와 Firebase Admin 앱을 초기화합니다.
    // 이 방식은 서비스 계정 키 파일을 직접 코드에 포함하지 않아 더 안전합니다.
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
    console.log("Firebase Admin SDK initialized successfully.");
  } catch (error) {
    console.error("Firebase Admin SDK initialization error:", error);
  }
}

// 초기화된 Firebase Admin 앱에서 Firestore 데이터베이스 인스턴스를 가져옵니다.
// 이 'adminDb'는 모든 보안 규칙을 우회하는 관리자 권한을 가집니다.
const adminDb = admin.firestore();

// 다른 서버 측 파일에서 관리자용 DB 인스턴스를 사용할 수 있도록 export 합니다.
export { adminDb };
