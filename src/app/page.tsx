import { LoadingSpinner } from "@/components/ui";
import dynamic from "next/dynamic";

const HomePage = dynamic(() => import("@/components/organism/home"), {
  ssr: false,
  loading: LoadingSpinner,
});

export default HomePage;
