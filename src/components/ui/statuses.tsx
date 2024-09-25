import { Button } from "@/components/ui/button";
import { LoadingClock } from "@/components/ui/loading-clock";
import { CreateModal } from "@/components/modals";
import { Ghost } from "lucide-react";
import { Squircle } from "@squircle-js/react";

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
      <Squircle asChild cornerRadius={12} cornerSmoothing={1}>
        <Button variant="secondary" className={"rounded-xl"}>
          <LoadingClock className={"w-6 h-6 mr-1"} /> Fetching Ads
        </Button>
      </Squircle>
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