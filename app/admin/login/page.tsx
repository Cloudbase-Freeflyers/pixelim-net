import { isGoogleLoginEnabled } from "@/lib/admin-google-auth";
import LoginForm from "./LoginForm";

export const metadata = { title: "Admin Login — Pixelim" };

export default function LoginPage() {
  const googleEnabled = isGoogleLoginEnabled();
  const usernameEnabled = Boolean(process.env.ADMIN_USERNAME?.trim());
  return <LoginForm googleEnabled={googleEnabled} usernameEnabled={usernameEnabled} />;
}
