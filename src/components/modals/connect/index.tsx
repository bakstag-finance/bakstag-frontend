import { Modal } from "./modal";
import { useEffect, useState } from "react";

interface Props {
  refetch: () => void;
  btnText?: string;
}

const ConnectModal = ({ refetch, btnText }: Props) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return <Modal refetch={refetch} btnText={btnText} />;
};

export { ConnectModal };
