import {
  createContext,
  useContext,
  useState,
  Dispatch,
  SetStateAction,
  ReactNode,
} from "react";
import { Status } from "@/types/contracts";
import { Offer } from "@/types/offer";

export type ConnectModalStep = "main" | "transaction";

interface AcceptModalContextProps {
  openModal: boolean;
  setOpenModal: Dispatch<SetStateAction<boolean>>;
  step: ConnectModalStep;
  setStep: Dispatch<SetStateAction<ConnectModalStep>>;
  srcTokenAmount: string;
  setSrcTokenAmount: Dispatch<SetStateAction<string>>;
  dstTokenAmount: string;
  setDstTokenAmount: Dispatch<SetStateAction<string>>;
  destinationWallet: string;
  setDestinationWallet: Dispatch<SetStateAction<string>>;
  approvingStatus: Status;
  setApprovingStatus: Dispatch<SetStateAction<Status>>;
  approvingErrorMsg: string;
  setApprovingErrorMsg: Dispatch<SetStateAction<string>>;
  transactionStatus: Status;
  setTransactionStatus: Dispatch<SetStateAction<Status>>;
  infoForTransactionStep: any;
  setInfoForTransactionStep: Dispatch<SetStateAction<any>>;
  handleClose: () => void;
  handleResetState: () => void;
  offer: Offer | undefined;
  refetch: () => void;
}

const AcceptModalContext = createContext<AcceptModalContextProps | null>(null);

export const useAcceptModal = () => {
  const context = useContext(AcceptModalContext);
  if (!context) {
    throw new Error(
      "useAcceptModal must be used within an AcceptModalProvider",
    );
  }
  return context;
};

interface AcceptModalProviderProps {
  children: ReactNode;
  offer: Offer;
  refetch: () => void;
}

const AcceptModalProvider = ({
  children,
  offer,
  refetch,
}: AcceptModalProviderProps) => {
  const [openModal, setOpenModal] = useState(false);
  const [step, setStep] = useState<ConnectModalStep>("main");
  const [srcTokenAmount, setSrcTokenAmount] = useState("0");
  const [dstTokenAmount, setDstTokenAmount] = useState("0");
  const [destinationWallet, setDestinationWallet] = useState("");
  const [approvingStatus, setApprovingStatus] = useState<Status>("idle");
  const [approvingErrorMsg, setApprovingErrorMsg] = useState("");
  const [transactionStatus, setTransactionStatus] = useState<Status>("idle");
  const [infoForTransactionStep, setInfoForTransactionStep] = useState({
    txHash: "",
    offerId: "",
    srcChainId: undefined,
    srcEid: "",
    srcTokenAddress: "",
    dstTokenAddress: "",
    srcTokenAmount: "",
    exchangeRate: "",
    srcAmountLD: "",
    srcTokenTicker: "",
    srcTokenNetwork: "",
    dstTokenNetwork: "",
    dstTokenTicker: "",
  });

  const handleResetState = () => {
    setStep("main");
    setSrcTokenAmount("0");
    setDstTokenAmount("0");
    setDestinationWallet("");
    setApprovingStatus("idle");
    setTransactionStatus("idle");
  };

  const handleClose = () => {
    setOpenModal(false);
    handleResetState();
  };

  return (
    <AcceptModalContext.Provider
      value={{
        openModal,
        setOpenModal,
        step,
        setStep,
        srcTokenAmount,
        setSrcTokenAmount,
        dstTokenAmount,
        setDstTokenAmount,
        destinationWallet,
        setDestinationWallet,
        approvingStatus,
        setApprovingStatus,
        approvingErrorMsg,
        setApprovingErrorMsg,
        transactionStatus,
        setTransactionStatus,
        infoForTransactionStep,
        setInfoForTransactionStep,
        handleClose,
        handleResetState,
        offer,
        refetch,
      }}
    >
      {children}
    </AcceptModalContext.Provider>
  );
};

export default AcceptModalProvider;
