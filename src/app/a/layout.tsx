import { MotionProvider } from "@/components/MotionProvider";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <MotionProvider>{children}</MotionProvider>;
}
