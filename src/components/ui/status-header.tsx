import { CircleCheck, Clock11, FileWarning } from "lucide-react";

interface StatusProps {
  isError: boolean;
  isLoading: boolean;
  isSuccess: boolean;
  errorMessage: { title: string; subtitle: string };
  loadingMessage: { title: string; subtitle: string };
  successMessage: { title: string; subtitle: string };
}

export const StatusHeader = ({
  isError,
  isLoading,
  isSuccess,
  errorMessage,
  loadingMessage,
  successMessage,
}: StatusProps) => {
  const renderIcon = () => {
    if (isError) return <FileWarning className="size-16 stroke-[0.5]" />;
    if (isLoading)
      return <Clock11 className="size-16 text-white stroke-[0.5]" />;
    if (isSuccess) return <CircleCheck className="size-16 stroke-[0.5]" />;
    return null;
  };

  const renderMessage = () => {
    if (isError) {
      return (
        <>
          <span className="mt-5">{errorMessage.title}</span>
          <span className="text-gray-700 mt-2">{errorMessage.subtitle}</span>
        </>
      );
    }

    if (isLoading) {
      return (
        <>
          <span className="mt-5">{loadingMessage.title}</span>
          <span className="text-gray-700 mt-2">{loadingMessage.subtitle}</span>
        </>
      );
    }

    if (isSuccess) {
      return (
        <>
          <span className="mt-5">{successMessage.title}</span>
          <span className="text-gray-700 mt-2">{successMessage.subtitle}</span>
        </>
      );
    }

    return null;
  };

  return (
    <div className="w-full h-44 flex flex-col justify-center items-center mt-2 text-xs text-white">
      {renderIcon()}
      {renderMessage()}
    </div>
  );
};
