import { z } from "zod";

export const SignupSchema = z
  .object({
    email: z
      .string()
      .email("유효한 이메일을 입력하세요.")
      .max(254, "이메일은 254자 이하로 입력하세요."),
    password: z
      .string()
      .min(8, "8자 이상 비밀번호가 필요합니다.")
      .max(25, "25자 이하로 입력하세요."),
    confirm: z.string().max(25, "25자 이하로 입력하세요."),
    terms: z.literal(true, {
      errorMap: () => ({ message: "약관에 동의해야 가입할 수 있습니다." }),
    }),
  })
  .refine((d) => d.password === d.confirm, {
    path: ["confirm"],
    message: "비밀번호가 일치하지 않습니다.",
  });

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});


export const ChangePasswordSchema = z
  .object({
    // 1. 기존 비밀번호 확인을 위한 필드
    currentPassword: z
      .string()
      .min(8, "현재 비밀번호는 8자 이상이어야 합니다."), // 최소 길이만 검사

    // 2. 새 비밀번호 유효성 검사를 위한 필드
    newPassword: z
      .string()
      .min(8, "새 비밀번호는 8자 이상이어야 합니다.")
      .max(25, "새 비밀번호는 25자 이하로 입력하세요."),

    // (선택적) 새 비밀번호 확인 필드 추가
    newConfirm: z.string().max(25, "새 비밀번호 확인은 25자 이하로 입력하세요."),
  })
  // 새 비밀번호와 새 비밀번호 확인 필드가 일치하는지 검증
  .refine((d) => d.newPassword === d.newConfirm, {
    path: ["newConfirm"],
    message: "새 비밀번호가 일치하지 않습니다.",
  })
  // (선택적) 기존 비밀번호와 새 비밀번호가 같은지 검증
  .refine((d) => d.currentPassword !== d.newPassword, {
    path: ["newPassword"],
    message: "새 비밀번호는 기존 비밀번호와 달라야 합니다.",
  });