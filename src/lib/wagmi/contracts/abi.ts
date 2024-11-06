//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// OtcMarket
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const otcMarketAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "_treasury", internalType: "address", type: "address" },
      { name: "_endpoint", internalType: "address", type: "address" },
      { name: "_delegate", internalType: "address", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "error",
    inputs: [{ name: "target", internalType: "address", type: "address" }],
    name: "AddressEmptyCode",
  },
  {
    type: "error",
    inputs: [{ name: "account", internalType: "address", type: "address" }],
    name: "AddressInsufficientBalance",
  },
  {
    type: "error",
    inputs: [
      { name: "available", internalType: "uint64", type: "uint64" },
      { name: "desired", internalType: "uint64", type: "uint64" },
    ],
    name: "ExcessiveAmount",
  },
  { type: "error", inputs: [], name: "FailedInnerCall" },
  { type: "error", inputs: [], name: "InvalidDelegate" },
  {
    type: "error",
    inputs: [
      { name: "required", internalType: "uint32", type: "uint32" },
      { name: "provided", internalType: "uint32", type: "uint32" },
    ],
    name: "InvalidEid",
  },
  { type: "error", inputs: [], name: "InvalidEndpointCall" },
  { type: "error", inputs: [], name: "InvalidNonce" },
  {
    type: "error",
    inputs: [{ name: "options", internalType: "bytes", type: "bytes" }],
    name: "InvalidOptions",
  },
  {
    type: "error",
    inputs: [
      { name: "srcAmountSD", internalType: "uint64", type: "uint64" },
      { name: "exchangeRateSD", internalType: "uint64", type: "uint64" },
    ],
    name: "InvalidPricing",
  },
  {
    type: "error",
    inputs: [{ name: "receiver", internalType: "address", type: "address" }],
    name: "InvalidReceiver",
  },
  { type: "error", inputs: [], name: "LzTokenUnavailable" },
  {
    type: "error",
    inputs: [
      { name: "to", internalType: "address", type: "address" },
      { name: "value", internalType: "uint256", type: "uint256" },
    ],
    name: "NativeTransferFailed",
  },
  {
    type: "error",
    inputs: [{ name: "eid", internalType: "uint32", type: "uint32" }],
    name: "NoPeer",
  },
  {
    type: "error",
    inputs: [{ name: "offerId", internalType: "bytes32", type: "bytes32" }],
    name: "NonexistentOffer",
  },
  {
    type: "error",
    inputs: [{ name: "msgValue", internalType: "uint256", type: "uint256" }],
    name: "NotEnoughNative",
  },
  {
    type: "error",
    inputs: [{ name: "offerId", internalType: "bytes32", type: "bytes32" }],
    name: "OfferAlreadyExists",
  },
  {
    type: "error",
    inputs: [{ name: "addr", internalType: "address", type: "address" }],
    name: "OnlyEndpoint",
  },
  {
    type: "error",
    inputs: [
      { name: "eid", internalType: "uint32", type: "uint32" },
      { name: "sender", internalType: "bytes32", type: "bytes32" },
    ],
    name: "OnlyPeer",
  },
  {
    type: "error",
    inputs: [
      { name: "seller", internalType: "bytes32", type: "bytes32" },
      { name: "account", internalType: "bytes32", type: "bytes32" },
    ],
    name: "OnlySeller",
  },
  {
    type: "error",
    inputs: [{ name: "owner", internalType: "address", type: "address" }],
    name: "OwnableInvalidOwner",
  },
  {
    type: "error",
    inputs: [{ name: "account", internalType: "address", type: "address" }],
    name: "OwnableUnauthorizedAccount",
  },
  {
    type: "error",
    inputs: [
      { name: "bits", internalType: "uint8", type: "uint8" },
      { name: "value", internalType: "uint256", type: "uint256" },
    ],
    name: "SafeCastOverflowedUintDowncast",
  },
  {
    type: "error",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "SafeERC20FailedOperation",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "_enforcedOptions",
        internalType: "struct EnforcedOptionParam[]",
        type: "tuple[]",
        components: [
          { name: "eid", internalType: "uint32", type: "uint32" },
          { name: "msgType", internalType: "uint16", type: "uint16" },
          { name: "options", internalType: "bytes", type: "bytes" },
        ],
        indexed: false,
      },
    ],
    name: "EnforcedOptionSet",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "offerId",
        internalType: "bytes32",
        type: "bytes32",
        indexed: true,
      },
      {
        name: "srcAmountSD",
        internalType: "uint64",
        type: "uint64",
        indexed: false,
      },
      {
        name: "srcBuyerAddress",
        internalType: "bytes32",
        type: "bytes32",
        indexed: true,
      },
      {
        name: "dstBuyerAddress",
        internalType: "bytes32",
        type: "bytes32",
        indexed: true,
      },
    ],
    name: "OfferAccepted",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "offerId",
        internalType: "bytes32",
        type: "bytes32",
        indexed: true,
      },
    ],
    name: "OfferCanceled",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "offerId",
        internalType: "bytes32",
        type: "bytes32",
        indexed: true,
      },
      {
        name: "offer",
        internalType: "struct IOtcMarketCore.Offer",
        type: "tuple",
        components: [
          {
            name: "srcSellerAddress",
            internalType: "bytes32",
            type: "bytes32",
          },
          {
            name: "dstSellerAddress",
            internalType: "bytes32",
            type: "bytes32",
          },
          { name: "srcEid", internalType: "uint32", type: "uint32" },
          { name: "dstEid", internalType: "uint32", type: "uint32" },
          { name: "srcTokenAddress", internalType: "bytes32", type: "bytes32" },
          { name: "dstTokenAddress", internalType: "bytes32", type: "bytes32" },
          { name: "srcAmountSD", internalType: "uint64", type: "uint64" },
          { name: "exchangeRateSD", internalType: "uint64", type: "uint64" },
        ],
        indexed: false,
      },
    ],
    name: "OfferCreated",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "previousOwner",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "newOwner",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "OwnershipTransferred",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "eid", internalType: "uint32", type: "uint32", indexed: false },
      {
        name: "peer",
        internalType: "bytes32",
        type: "bytes32",
        indexed: false,
      },
    ],
    name: "PeerSet",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "treasury",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "TreasurySet",
  },
  {
    type: "function",
    inputs: [],
    name: "FEE",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "SHARED_DECIMALS",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      {
        name: "_params",
        internalType: "struct IOtcMarketAcceptOffer.AcceptOfferParams",
        type: "tuple",
        components: [
          { name: "offerId", internalType: "bytes32", type: "bytes32" },
          { name: "srcAmountSD", internalType: "uint64", type: "uint64" },
          { name: "srcBuyerAddress", internalType: "bytes32", type: "bytes32" },
        ],
      },
      {
        name: "_fee",
        internalType: "struct MessagingFee",
        type: "tuple",
        components: [
          { name: "nativeFee", internalType: "uint256", type: "uint256" },
          { name: "lzTokenFee", internalType: "uint256", type: "uint256" },
        ],
      },
    ],
    name: "acceptOffer",
    outputs: [
      {
        name: "msgReceipt",
        internalType: "struct MessagingReceipt",
        type: "tuple",
        components: [
          { name: "guid", internalType: "bytes32", type: "bytes32" },
          { name: "nonce", internalType: "uint64", type: "uint64" },
          {
            name: "fee",
            internalType: "struct MessagingFee",
            type: "tuple",
            components: [
              { name: "nativeFee", internalType: "uint256", type: "uint256" },
              { name: "lzTokenFee", internalType: "uint256", type: "uint256" },
            ],
          },
        ],
      },
      {
        name: "acceptOfferReceipt",
        internalType: "struct IOtcMarketAcceptOffer.AcceptOfferReceipt",
        type: "tuple",
        components: [
          { name: "dstAmountLD", internalType: "uint256", type: "uint256" },
          { name: "feeLD", internalType: "uint256", type: "uint256" },
        ],
      },
    ],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "origin",
        internalType: "struct Origin",
        type: "tuple",
        components: [
          { name: "srcEid", internalType: "uint32", type: "uint32" },
          { name: "sender", internalType: "bytes32", type: "bytes32" },
          { name: "nonce", internalType: "uint64", type: "uint64" },
        ],
      },
    ],
    name: "allowInitializePath",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_offerId", internalType: "bytes32", type: "bytes32" },
      {
        name: "_fee",
        internalType: "struct MessagingFee",
        type: "tuple",
        components: [
          { name: "nativeFee", internalType: "uint256", type: "uint256" },
          { name: "lzTokenFee", internalType: "uint256", type: "uint256" },
        ],
      },
      { name: "_extraSendOptions", internalType: "bytes", type: "bytes" },
    ],
    name: "cancelOffer",
    outputs: [
      {
        name: "msgReceipt",
        internalType: "struct MessagingReceipt",
        type: "tuple",
        components: [
          { name: "guid", internalType: "bytes32", type: "bytes32" },
          { name: "nonce", internalType: "uint64", type: "uint64" },
          {
            name: "fee",
            internalType: "struct MessagingFee",
            type: "tuple",
            components: [
              { name: "nativeFee", internalType: "uint256", type: "uint256" },
              { name: "lzTokenFee", internalType: "uint256", type: "uint256" },
            ],
          },
        ],
      },
    ],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [
      { name: "_eid", internalType: "uint32", type: "uint32" },
      { name: "_msgType", internalType: "uint16", type: "uint16" },
      { name: "_extraOptions", internalType: "bytes", type: "bytes" },
    ],
    name: "combineOptions",
    outputs: [{ name: "", internalType: "bytes", type: "bytes" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      {
        name: "_params",
        internalType: "struct IOtcMarketCreateOffer.CreateOfferParams",
        type: "tuple",
        components: [
          {
            name: "dstSellerAddress",
            internalType: "bytes32",
            type: "bytes32",
          },
          { name: "dstEid", internalType: "uint32", type: "uint32" },
          { name: "srcTokenAddress", internalType: "bytes32", type: "bytes32" },
          { name: "dstTokenAddress", internalType: "bytes32", type: "bytes32" },
          { name: "srcAmountLD", internalType: "uint256", type: "uint256" },
          { name: "exchangeRateSD", internalType: "uint64", type: "uint64" },
        ],
      },
      {
        name: "_fee",
        internalType: "struct MessagingFee",
        type: "tuple",
        components: [
          { name: "nativeFee", internalType: "uint256", type: "uint256" },
          { name: "lzTokenFee", internalType: "uint256", type: "uint256" },
        ],
      },
    ],
    name: "createOffer",
    outputs: [
      {
        name: "msgReceipt",
        internalType: "struct MessagingReceipt",
        type: "tuple",
        components: [
          { name: "guid", internalType: "bytes32", type: "bytes32" },
          { name: "nonce", internalType: "uint64", type: "uint64" },
          {
            name: "fee",
            internalType: "struct MessagingFee",
            type: "tuple",
            components: [
              { name: "nativeFee", internalType: "uint256", type: "uint256" },
              { name: "lzTokenFee", internalType: "uint256", type: "uint256" },
            ],
          },
        ],
      },
      {
        name: "createOfferReceipt",
        internalType: "struct IOtcMarketCreateOffer.CreateOfferReceipt",
        type: "tuple",
        components: [
          { name: "offerId", internalType: "bytes32", type: "bytes32" },
          { name: "srcAmountLD", internalType: "uint256", type: "uint256" },
        ],
      },
    ],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [],
    name: "eid",
    outputs: [{ name: "", internalType: "uint32", type: "uint32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "endpoint",
    outputs: [
      {
        name: "",
        internalType: "contract ILayerZeroEndpointV2",
        type: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "eid", internalType: "uint32", type: "uint32" },
      { name: "msgType", internalType: "uint16", type: "uint16" },
    ],
    name: "enforcedOptions",
    outputs: [{ name: "enforcedOption", internalType: "bytes", type: "bytes" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "escrow",
    outputs: [{ name: "", internalType: "contract Escrow", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_srcSellerAddress", internalType: "bytes32", type: "bytes32" },
      { name: "_srcEid", internalType: "uint32", type: "uint32" },
      { name: "_dstEid", internalType: "uint32", type: "uint32" },
      { name: "_srcTokenAddress", internalType: "bytes32", type: "bytes32" },
      { name: "_dstTokenAddress", internalType: "bytes32", type: "bytes32" },
      { name: "_exchangeRateSD", internalType: "uint64", type: "uint64" },
    ],
    name: "hashOffer",
    outputs: [{ name: "offerId", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "pure",
  },
  {
    type: "function",
    inputs: [
      {
        name: "",
        internalType: "struct Origin",
        type: "tuple",
        components: [
          { name: "srcEid", internalType: "uint32", type: "uint32" },
          { name: "sender", internalType: "bytes32", type: "bytes32" },
          { name: "nonce", internalType: "uint64", type: "uint64" },
        ],
      },
      { name: "", internalType: "bytes", type: "bytes" },
      { name: "_sender", internalType: "address", type: "address" },
    ],
    name: "isComposeMsgSender",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      {
        name: "_origin",
        internalType: "struct Origin",
        type: "tuple",
        components: [
          { name: "srcEid", internalType: "uint32", type: "uint32" },
          { name: "sender", internalType: "bytes32", type: "bytes32" },
          { name: "nonce", internalType: "uint64", type: "uint64" },
        ],
      },
      { name: "_guid", internalType: "bytes32", type: "bytes32" },
      { name: "_message", internalType: "bytes", type: "bytes" },
      { name: "_executor", internalType: "address", type: "address" },
      { name: "_extraData", internalType: "bytes", type: "bytes" },
    ],
    name: "lzReceive",
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [
      { name: "_srcEid", internalType: "uint32", type: "uint32" },
      { name: "_sender", internalType: "bytes32", type: "bytes32" },
    ],
    name: "nextNonce",
    outputs: [{ name: "", internalType: "uint64", type: "uint64" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "oAppVersion",
    outputs: [
      { name: "senderVersion", internalType: "uint64", type: "uint64" },
      { name: "receiverVersion", internalType: "uint64", type: "uint64" },
    ],
    stateMutability: "pure",
  },
  {
    type: "function",
    inputs: [{ name: "offerId", internalType: "bytes32", type: "bytes32" }],
    name: "offers",
    outputs: [
      { name: "srcSellerAddress", internalType: "bytes32", type: "bytes32" },
      { name: "dstSellerAddress", internalType: "bytes32", type: "bytes32" },
      { name: "srcEid", internalType: "uint32", type: "uint32" },
      { name: "dstEid", internalType: "uint32", type: "uint32" },
      { name: "srcTokenAddress", internalType: "bytes32", type: "bytes32" },
      { name: "dstTokenAddress", internalType: "bytes32", type: "bytes32" },
      { name: "srcAmountSD", internalType: "uint64", type: "uint64" },
      { name: "exchangeRateSD", internalType: "uint64", type: "uint64" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "owner",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "eid", internalType: "uint32", type: "uint32" }],
    name: "peers",
    outputs: [{ name: "peer", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_dstBuyerAddress", internalType: "bytes32", type: "bytes32" },
      {
        name: "_params",
        internalType: "struct IOtcMarketAcceptOffer.AcceptOfferParams",
        type: "tuple",
        components: [
          { name: "offerId", internalType: "bytes32", type: "bytes32" },
          { name: "srcAmountSD", internalType: "uint64", type: "uint64" },
          { name: "srcBuyerAddress", internalType: "bytes32", type: "bytes32" },
        ],
      },
      { name: "_payInLzToken", internalType: "bool", type: "bool" },
    ],
    name: "quoteAcceptOffer",
    outputs: [
      {
        name: "fee",
        internalType: "struct MessagingFee",
        type: "tuple",
        components: [
          { name: "nativeFee", internalType: "uint256", type: "uint256" },
          { name: "lzTokenFee", internalType: "uint256", type: "uint256" },
        ],
      },
      {
        name: "acceptOfferReceipt",
        internalType: "struct IOtcMarketAcceptOffer.AcceptOfferReceipt",
        type: "tuple",
        components: [
          { name: "dstAmountLD", internalType: "uint256", type: "uint256" },
          { name: "feeLD", internalType: "uint256", type: "uint256" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "_offerId", internalType: "bytes32", type: "bytes32" }],
    name: "quoteCancelOffer",
    outputs: [
      {
        name: "fee",
        internalType: "struct MessagingFee",
        type: "tuple",
        components: [
          { name: "nativeFee", internalType: "uint256", type: "uint256" },
          { name: "lzTokenFee", internalType: "uint256", type: "uint256" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_srcSellerAddress", internalType: "bytes32", type: "bytes32" },
      { name: "_offerId", internalType: "bytes32", type: "bytes32" },
      { name: "_extraSendOptions", internalType: "bytes", type: "bytes" },
      { name: "_payInLzToken", internalType: "bool", type: "bool" },
    ],
    name: "quoteCancelOfferOrder",
    outputs: [
      {
        name: "fee",
        internalType: "struct MessagingFee",
        type: "tuple",
        components: [
          { name: "nativeFee", internalType: "uint256", type: "uint256" },
          { name: "lzTokenFee", internalType: "uint256", type: "uint256" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_srcSellerAddress", internalType: "bytes32", type: "bytes32" },
      {
        name: "_params",
        internalType: "struct IOtcMarketCreateOffer.CreateOfferParams",
        type: "tuple",
        components: [
          {
            name: "dstSellerAddress",
            internalType: "bytes32",
            type: "bytes32",
          },
          { name: "dstEid", internalType: "uint32", type: "uint32" },
          { name: "srcTokenAddress", internalType: "bytes32", type: "bytes32" },
          { name: "dstTokenAddress", internalType: "bytes32", type: "bytes32" },
          { name: "srcAmountLD", internalType: "uint256", type: "uint256" },
          { name: "exchangeRateSD", internalType: "uint64", type: "uint64" },
        ],
      },
      { name: "_payInLzToken", internalType: "bool", type: "bool" },
    ],
    name: "quoteCreateOffer",
    outputs: [
      {
        name: "fee",
        internalType: "struct MessagingFee",
        type: "tuple",
        components: [
          { name: "nativeFee", internalType: "uint256", type: "uint256" },
          { name: "lzTokenFee", internalType: "uint256", type: "uint256" },
        ],
      },
      {
        name: "createOfferReceipt",
        internalType: "struct IOtcMarketCreateOffer.CreateOfferReceipt",
        type: "tuple",
        components: [
          { name: "offerId", internalType: "bytes32", type: "bytes32" },
          { name: "srcAmountLD", internalType: "uint256", type: "uint256" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "_delegate", internalType: "address", type: "address" }],
    name: "setDelegate",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "_enforcedOptions",
        internalType: "struct EnforcedOptionParam[]",
        type: "tuple[]",
        components: [
          { name: "eid", internalType: "uint32", type: "uint32" },
          { name: "msgType", internalType: "uint16", type: "uint16" },
          { name: "options", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    name: "setEnforcedOptions",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_eid", internalType: "uint32", type: "uint32" },
      { name: "_peer", internalType: "bytes32", type: "bytes32" },
    ],
    name: "setPeer",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "_treasury", internalType: "address", type: "address" }],
    name: "setTreasury",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "newOwner", internalType: "address", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "treasury",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
] as const;

export const otcMarketAddress =
  "0xC478298EF25aD3F41A9DA7a8F449D2c891F56e81" as const;

export const otcMarketConfig = {
  address: otcMarketAddress,
  abi: otcMarketAbi,
} as const;
