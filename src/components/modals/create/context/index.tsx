import {
  createContext,
  useContext,
  useState,
  Dispatch,
  SetStateAction,
  ReactNode,
} from "react";
import { ChainIds, Status } from "@/types/contracts";

export type CreateModalStep = "main" | "transaction";

export interface TransactionData {
  txHash: string;
  srcEid: number;
  srcChainId: undefined | ChainIds;
  offerId: string;
  dstEid: number;
  srcSellerAddress: string;
  dstSellerAddress: string;
  srcTokenAddress: string;
  dstTokenAddress: string;
  srcAmountLD: bigint;
  exchangeRateSD: bigint;
}

const defaultTransactionData: TransactionData = {
  txHash: "",
  srcEid: 0,
  srcChainId: undefined as ChainIds,
  offerId: "",
  dstEid: 0,
  srcSellerAddress: "",
  dstSellerAddress: "",
  srcTokenAddress: "",
  dstTokenAddress: "",
  srcAmountLD: BigInt(0),
  exchangeRateSD: BigInt(0),
};

interface CreateModalContextProps {
  openModal: boolean;
  setOpenModal: Dispatch<SetStateAction<boolean>>;
  currentStep: CreateModalStep;
  setCurrentStep: Dispatch<SetStateAction<CreateModalStep>>;
  selectedSrcToken: string;
  setSelectedSrcToken: Dispatch<SetStateAction<string>>;
  selectedDstToken: string;
  setSelectedDstToken: Dispatch<SetStateAction<string>>;
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
  transactionData: TransactionData;
  setTransactionData: Dispatch<SetStateAction<TransactionData>>;
}

const CreateModalContext = createContext<CreateModalContextProps | null>(null);

const CreateModalProvider = ({ children }: { children: ReactNode }) => {
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<CreateModalStep>("main");

  const [selectedSrcToken, setSelectedSrcToken] = useState<string>("");
  const [selectedDstToken, setSelectedDstToken] = useState<string>("");

  const [srcTokenAmount, setSrcTokenAmount] = useState<string>("");
  const [dstTokenAmount, setDstTokenAmount] = useState<string>("");

  const [destinationWallet, setDestinationWallet] = useState<string>("");

  const [approvingStatus, setApprovingStatus] = useState<Status>("idle");
  const [approvingErrorMsg, setApprovingErrorMsg] = useState<string>("");

  const [transactionData, setTransactionData] = useState<TransactionData>(
    defaultTransactionData,
  );

  const [transactionStatus, setTransactionStatus] = useState<Status>("idle");

  return (
    <CreateModalContext.Provider
      value={{
        openModal,
        setOpenModal,
        currentStep,
        setCurrentStep,
        selectedSrcToken,
        setSelectedSrcToken,
        selectedDstToken,
        setSelectedDstToken,
        srcTokenAmount,
        setSrcTokenAmount,
        dstTokenAmount,
        setDstTokenAmount,
        destinationWallet,
        setDestinationWallet,
        approvingStatus,
        approvingErrorMsg,
        setApprovingErrorMsg,
        setApprovingStatus,
        transactionStatus,
        setTransactionStatus,
        transactionData,
        setTransactionData,
      }}
    >
      {children}
    </CreateModalContext.Provider>
  );
};

export default CreateModalProvider;

export const useCreateModal = () => {
  const context = useContext(CreateModalContext);
  if (!context) {
    throw new Error("useCreateModal must be used within a CreateModalProvider");
  }
  return context;
};
