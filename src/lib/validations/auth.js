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
