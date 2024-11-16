import { Button } from "@/components/ui/button";
import { LoadingClock } from "@/components/ui/loading-clock";
import { CreateModal } from "@/components/modals";
import { Clock, Ghost } from "lucide-react";
import { Squircle } from "./squircle";
import { Suspense } from "react";

interface Props {
  refetch: () => void;
  error?: {
    title: string;
    subtitle: string;
  };
}

export const LoadingComponent = () => {
  return (
    <div className="flex justify-center items-center h-full my-full">
      <Suspense
        fallback={
          <Button variant="secondary" className={"rounded-xl"}>
            <Clock className={"w-6 h-6 mr-1"} />
          </Button>
        }
      >
        <Squircle asChild cornerRadius={12} cornerSmoothing={1}>
          <Button variant="secondary" className={"rounded-xl"}>
            <Suspense fallback={<Clock className={"w-6 h-6 mr-1"} />}>
              <LoadingClock className={"w-6 h-6 mr-1"} />
            </Suspense>{" "}
            Fetching Ads
          </Button>
        </Squircle>
      </Suspense>
    </div>
  );
};

export const ErrorComponent = ({ refetch }: Props) => {
  return (
    <div className="flex justify-center items-center h-full my-full">
      <Squircle asChild cornerRadius={12} cornerSmoothing={1}>
        <Button
          variant="destructive"
          onClick={refetch}
          className={"rounded-xl"}
        >
          Fetching Failed (Retry)
        </Button>
      </Squircle>
    </div>
  );
};

export const EmptyComponent = ({ refetch, error }: Props) => {
  return (
    <div className="flex flex-col justify-center items-center h-full my-full">
      {error ? (
        <>
          <Ghost className="w-20 h-28 stroke-[0.25]" />
          <span>{error.title}</span>
          <span className="text-gray-700 text-xs">{error.subtitle}</span>
        </>
      ) : (
        <CreateModal buttonText={"Create Ad"} refetch={refetch} />
      )}
    </div>
  );
};
