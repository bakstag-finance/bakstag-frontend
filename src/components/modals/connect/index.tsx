import { Modal } from "./modal";
import { useEffect, useState } from "react";

interface Props {
  refetch: () => void;
}

const ConnectModal = ({ refetch }: Props) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return <Modal refetch={refetch} />;
};

export { ConnectModal };
