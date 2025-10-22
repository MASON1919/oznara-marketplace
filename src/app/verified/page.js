// app/verified/page.jsx
export default function VerifiedPage() {
  return (
    <div className="max-w-md mx-auto mt-16 text-center space-y-4">
      <h1 className="text-2xl font-semibold">이메일 인증 완료</h1>
      <p className="text-muted-foreground">이제 로그인할 수 있습니다.</p>
      <a className="inline-block underline" href="/login">
        로그인하러 가기
      </a>
    </div>
  );
}
