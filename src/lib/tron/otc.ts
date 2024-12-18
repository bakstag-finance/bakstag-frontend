export const tronOtcAbi = {
  contractName: "OtcMarket",
  abi: [
    {
      inputs: [
        {
          internalType: "address",
          name: "_treasury",
          type: "address",
        },
        {
          internalType: "address",
          name: "_endpoint",
          type: "address",
        },
        {
          internalType: "address",
          name: "_delegate",
          type: "address",
        },
      ],
      stateMutability: "nonpayable",
      type: "constructor",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "target",
          type: "address",
        },
      ],
      name: "AddressEmptyCode",
      type: "error",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "account",
          type: "address",
        },
      ],
      name: "AddressInsufficientBalance",
      type: "error",
    },
    {
      inputs: [
        {
          internalType: "uint64",
          name: "available",
          type: "uint64",
        },
        {
          internalType: "uint64",
          name: "desired",
          type: "uint64",
        },
      ],
      name: "ExcessiveAmount",
      type: "error",
    },
    {
      inputs: [],
      name: "FailedInnerCall",
      type: "error",
    },
    {
      inputs: [],
      name: "InvalidDelegate",
      type: "error",
    },
    {
      inputs: [
        {
          internalType: "uint32",
          name: "required",
          type: "uint32",
        },
        {
          internalType: "uint32",
          name: "provided",
          type: "uint32",
        },
      ],
      name: "InvalidEid",
      type: "error",
    },
    {
      inputs: [],
      name: "InvalidEndpointCall",
      type: "error",
    },
    {
      inputs: [],
      name: "InvalidNonce",
      type: "error",
    },
    {
      inputs: [
        {
          internalType: "bytes",
          name: "options",
          type: "bytes",
        },
      ],
      name: "InvalidOptions",
      type: "error",
    },
    {
      inputs: [
        {
          internalType: "uint64",
          name: "srcAmountSD",
          type: "uint64",
        },
        {
          internalType: "uint64",
          name: "exchangeRateSD",
          type: "uint64",
        },
      ],
      name: "InvalidPricing",
      type: "error",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "receiver",
          type: "address",
        },
      ],
      name: "InvalidReceiver",
      type: "error",
    },
    {
      inputs: [],
      name: "LzTokenUnavailable",
      type: "error",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "to",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "value",
          type: "uint256",
        },
      ],
      name: "NativeTransferFailed",
      type: "error",
    },
    {
      inputs: [
        {
          internalType: "uint32",
          name: "eid",
          type: "uint32",
        },
      ],
      name: "NoPeer",
      type: "error",
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "offerId",
          type: "bytes32",
        },
      ],
      name: "NonexistentOffer",
      type: "error",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "msgValue",
          type: "uint256",
        },
      ],
      name: "NotEnoughNative",
      type: "error",
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "offerId",
          type: "bytes32",
        },
      ],
      name: "OfferAlreadyExists",
      type: "error",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "addr",
          type: "address",
        },
      ],
      name: "OnlyEndpoint",
      type: "error",
    },
    {
      inputs: [
        {
          internalType: "uint32",
          name: "eid",
          type: "uint32",
        },
        {
          internalType: "bytes32",
          name: "sender",
          type: "bytes32",
        },
      ],
      name: "OnlyPeer",
      type: "error",
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "seller",
          type: "bytes32",
        },
        {
          internalType: "bytes32",
          name: "account",
          type: "bytes32",
        },
      ],
      name: "OnlySeller",
      type: "error",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "owner",
          type: "address",
        },
      ],
      name: "OwnableInvalidOwner",
      type: "error",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "account",
          type: "address",
        },
      ],
      name: "OwnableUnauthorizedAccount",
      type: "error",
    },
    {
      inputs: [
        {
          internalType: "uint8",
          name: "bits",
          type: "uint8",
        },
        {
          internalType: "uint256",
          name: "value",
          type: "uint256",
        },
      ],
      name: "SafeCastOverflowedUintDowncast",
      type: "error",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "token",
          type: "address",
        },
      ],
      name: "SafeERC20FailedOperation",
      type: "error",
    },
    {
      anonymous: false,
      inputs: [
        {
          components: [
            {
              internalType: "uint32",
              name: "eid",
              type: "uint32",
            },
            {
              internalType: "uint16",
              name: "msgType",
              type: "uint16",
            },
            {
              internalType: "bytes",
              name: "options",
              type: "bytes",
            },
          ],
          indexed: false,
          internalType: "struct EnforcedOptionParam[]",
          name: "_enforcedOptions",
          type: "tuple[]",
        },
      ],
      name: "EnforcedOptionSet",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "bytes32",
          name: "offerId",
          type: "bytes32",
        },
        {
          indexed: false,
          internalType: "uint64",
          name: "srcAmountSD",
          type: "uint64",
        },
        {
          indexed: true,
          internalType: "bytes32",
          name: "srcBuyerAddress",
          type: "bytes32",
        },
        {
          indexed: true,
          internalType: "bytes32",
          name: "dstBuyerAddress",
          type: "bytes32",
        },
      ],
      name: "OfferAccepted",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "bytes32",
          name: "offerId",
          type: "bytes32",
        },
      ],
      name: "OfferCanceled",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "bytes32",
          name: "offerId",
          type: "bytes32",
        },
        {
          components: [
            {
              internalType: "bytes32",
              name: "srcSellerAddress",
              type: "bytes32",
            },
            {
              internalType: "bytes32",
              name: "dstSellerAddress",
              type: "bytes32",
            },
            {
              internalType: "uint32",
              name: "srcEid",
              type: "uint32",
            },
            {
              internalType: "uint32",
              name: "dstEid",
              type: "uint32",
            },
            {
              internalType: "bytes32",
              name: "srcTokenAddress",
              type: "bytes32",
            },
            {
              internalType: "bytes32",
              name: "dstTokenAddress",
              type: "bytes32",
            },
            {
              internalType: "uint64",
              name: "srcAmountSD",
              type: "uint64",
            },
            {
              internalType: "uint64",
              name: "exchangeRateSD",
              type: "uint64",
            },
          ],
          indexed: false,
          internalType: "struct IOtcMarketCore.Offer",
          name: "offer",
          type: "tuple",
        },
      ],
      name: "OfferCreated",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "previousOwner",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "newOwner",
          type: "address",
        },
      ],
      name: "OwnershipTransferred",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "uint32",
          name: "eid",
          type: "uint32",
        },
        {
          indexed: false,
          internalType: "bytes32",
          name: "peer",
          type: "bytes32",
        },
      ],
      name: "PeerSet",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "address",
          name: "treasury",
          type: "address",
        },
      ],
      name: "TreasurySet",
      type: "event",
    },
    {
      inputs: [],
      name: "FEE",
      outputs: [
        {
          internalType: "uint8",
          name: "",
          type: "uint8",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "SHARED_DECIMALS",
      outputs: [
        {
          internalType: "uint8",
          name: "",
          type: "uint8",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          components: [
            {
              internalType: "bytes32",
              name: "offerId",
              type: "bytes32",
            },
            {
              internalType: "uint64",
              name: "srcAmountSD",
              type: "uint64",
            },
            {
              internalType: "bytes32",
              name: "srcBuyerAddress",
              type: "bytes32",
            },
          ],
          internalType: "struct IOtcMarketAcceptOffer.AcceptOfferParams",
          name: "_params",
          type: "tuple",
        },
        {
          components: [
            {
              internalType: "uint256",
              name: "nativeFee",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "lzTokenFee",
              type: "uint256",
            },
          ],
          internalType: "struct MessagingFee",
          name: "_fee",
          type: "tuple",
        },
      ],
      name: "acceptOffer",
      outputs: [
        {
          components: [
            {
              internalType: "bytes32",
              name: "guid",
              type: "bytes32",
            },
            {
              internalType: "uint64",
              name: "nonce",
              type: "uint64",
            },
            {
              components: [
                {
                  internalType: "uint256",
                  name: "nativeFee",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "lzTokenFee",
                  type: "uint256",
                },
              ],
              internalType: "struct MessagingFee",
              name: "fee",
              type: "tuple",
            },
          ],
          internalType: "struct MessagingReceipt",
          name: "msgReceipt",
          type: "tuple",
        },
        {
          components: [
            {
              internalType: "uint256",
              name: "dstAmountLD",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "feeLD",
              type: "uint256",
            },
          ],
          internalType: "struct IOtcMarketAcceptOffer.AcceptOfferReceipt",
          name: "acceptOfferReceipt",
          type: "tuple",
        },
      ],
      stateMutability: "payable",
      type: "function",
    },
    {
      inputs: [
        {
          components: [
            {
              internalType: "uint32",
              name: "srcEid",
              type: "uint32",
            },
            {
              internalType: "bytes32",
              name: "sender",
              type: "bytes32",
            },
            {
              internalType: "uint64",
              name: "nonce",
              type: "uint64",
            },
          ],
          internalType: "struct Origin",
          name: "origin",
          type: "tuple",
        },
      ],
      name: "allowInitializePath",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "_offerId",
          type: "bytes32",
        },
        {
          components: [
            {
              internalType: "uint256",
              name: "nativeFee",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "lzTokenFee",
              type: "uint256",
            },
          ],
          internalType: "struct MessagingFee",
          name: "_fee",
          type: "tuple",
        },
        {
          internalType: "bytes",
          name: "_extraSendOptions",
          type: "bytes",
        },
      ],
      name: "cancelOffer",
      outputs: [
        {
          components: [
            {
              internalType: "bytes32",
              name: "guid",
              type: "bytes32",
            },
            {
              internalType: "uint64",
              name: "nonce",
              type: "uint64",
            },
            {
              components: [
                {
                  internalType: "uint256",
                  name: "nativeFee",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "lzTokenFee",
                  type: "uint256",
                },
              ],
              internalType: "struct MessagingFee",
              name: "fee",
              type: "tuple",
            },
          ],
          internalType: "struct MessagingReceipt",
          name: "msgReceipt",
          type: "tuple",
        },
      ],
      stateMutability: "payable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint32",
          name: "_eid",
          type: "uint32",
        },
        {
          internalType: "uint16",
          name: "_msgType",
          type: "uint16",
        },
        {
          internalType: "bytes",
          name: "_extraOptions",
          type: "bytes",
        },
      ],
      name: "combineOptions",
      outputs: [
        {
          internalType: "bytes",
          name: "",
          type: "bytes",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          components: [
            {
              internalType: "bytes32",
              name: "dstSellerAddress",
              type: "bytes32",
            },
            {
              internalType: "uint32",
              name: "dstEid",
              type: "uint32",
            },
            {
              internalType: "bytes32",
              name: "srcTokenAddress",
              type: "bytes32",
            },
            {
              internalType: "bytes32",
              name: "dstTokenAddress",
              type: "bytes32",
            },
            {
              internalType: "uint256",
              name: "srcAmountLD",
              type: "uint256",
            },
            {
              internalType: "uint64",
              name: "exchangeRateSD",
              type: "uint64",
            },
          ],
          internalType: "struct IOtcMarketCreateOffer.CreateOfferParams",
          name: "_params",
          type: "tuple",
        },
        {
          components: [
            {
              internalType: "uint256",
              name: "nativeFee",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "lzTokenFee",
              type: "uint256",
            },
          ],
          internalType: "struct MessagingFee",
          name: "_fee",
          type: "tuple",
        },
      ],
      name: "createOffer",
      outputs: [
        {
          components: [
            {
              internalType: "bytes32",
              name: "guid",
              type: "bytes32",
            },
            {
              internalType: "uint64",
              name: "nonce",
              type: "uint64",
            },
            {
              components: [
                {
                  internalType: "uint256",
                  name: "nativeFee",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "lzTokenFee",
                  type: "uint256",
                },
              ],
              internalType: "struct MessagingFee",
              name: "fee",
              type: "tuple",
            },
          ],
          internalType: "struct MessagingReceipt",
          name: "msgReceipt",
          type: "tuple",
        },
        {
          components: [
            {
              internalType: "bytes32",
              name: "offerId",
              type: "bytes32",
            },
            {
              internalType: "uint256",
              name: "srcAmountLD",
              type: "uint256",
            },
          ],
          internalType: "struct IOtcMarketCreateOffer.CreateOfferReceipt",
          name: "createOfferReceipt",
          type: "tuple",
        },
      ],
      stateMutability: "payable",
      type: "function",
    },
    {
      inputs: [],
      name: "eid",
      outputs: [
        {
          internalType: "uint32",
          name: "",
          type: "uint32",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "endpoint",
      outputs: [
        {
          internalType: "contract ILayerZeroEndpointV2",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint32",
          name: "eid",
          type: "uint32",
        },
        {
          internalType: "uint16",
          name: "msgType",
          type: "uint16",
        },
      ],
      name: "enforcedOptions",
      outputs: [
        {
          internalType: "bytes",
          name: "enforcedOption",
          type: "bytes",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "escrow",
      outputs: [
        {
          internalType: "contract Escrow",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "_srcSellerAddress",
          type: "bytes32",
        },
        {
          internalType: "uint32",
          name: "_srcEid",
          type: "uint32",
        },
        {
          internalType: "uint32",
          name: "_dstEid",
          type: "uint32",
        },
        {
          internalType: "bytes32",
          name: "_srcTokenAddress",
          type: "bytes32",
        },
        {
          internalType: "bytes32",
          name: "_dstTokenAddress",
          type: "bytes32",
        },
        {
          internalType: "uint64",
          name: "_exchangeRateSD",
          type: "uint64",
        },
      ],
      name: "hashOffer",
      outputs: [
        {
          internalType: "bytes32",
          name: "offerId",
          type: "bytes32",
        },
      ],
      stateMutability: "pure",
      type: "function",
    },
    {
      inputs: [
        {
          components: [
            {
              internalType: "uint32",
              name: "srcEid",
              type: "uint32",
            },
            {
              internalType: "bytes32",
              name: "sender",
              type: "bytes32",
            },
            {
              internalType: "uint64",
              name: "nonce",
              type: "uint64",
            },
          ],
          internalType: "struct Origin",
          name: "",
          type: "tuple",
        },
        {
          internalType: "bytes",
          name: "",
          type: "bytes",
        },
        {
          internalType: "address",
          name: "_sender",
          type: "address",
        },
      ],
      name: "isComposeMsgSender",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          components: [
            {
              internalType: "uint32",
              name: "srcEid",
              type: "uint32",
            },
            {
              internalType: "bytes32",
              name: "sender",
              type: "bytes32",
            },
            {
              internalType: "uint64",
              name: "nonce",
              type: "uint64",
            },
          ],
          internalType: "struct Origin",
          name: "_origin",
          type: "tuple",
        },
        {
          internalType: "bytes32",
          name: "_guid",
          type: "bytes32",
        },
        {
          internalType: "bytes",
          name: "_message",
          type: "bytes",
        },
        {
          internalType: "address",
          name: "_executor",
          type: "address",
        },
        {
          internalType: "bytes",
          name: "_extraData",
          type: "bytes",
        },
      ],
      name: "lzReceive",
      outputs: [],
      stateMutability: "payable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint32",
          name: "_srcEid",
          type: "uint32",
        },
        {
          internalType: "bytes32",
          name: "_sender",
          type: "bytes32",
        },
      ],
      name: "nextNonce",
      outputs: [
        {
          internalType: "uint64",
          name: "",
          type: "uint64",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "oAppVersion",
      outputs: [
        {
          internalType: "uint64",
          name: "senderVersion",
          type: "uint64",
        },
        {
          internalType: "uint64",
          name: "receiverVersion",
          type: "uint64",
        },
      ],
      stateMutability: "pure",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "offerId",
          type: "bytes32",
        },
      ],
      name: "offers",
      outputs: [
        {
          internalType: "bytes32",
          name: "srcSellerAddress",
          type: "bytes32",
        },
        {
          internalType: "bytes32",
          name: "dstSellerAddress",
          type: "bytes32",
        },
        {
          internalType: "uint32",
          name: "srcEid",
          type: "uint32",
        },
        {
          internalType: "uint32",
          name: "dstEid",
          type: "uint32",
        },
        {
          internalType: "bytes32",
          name: "srcTokenAddress",
          type: "bytes32",
        },
        {
          internalType: "bytes32",
          name: "dstTokenAddress",
          type: "bytes32",
        },
        {
          internalType: "uint64",
          name: "srcAmountSD",
          type: "uint64",
        },
        {
          internalType: "uint64",
          name: "exchangeRateSD",
          type: "uint64",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "owner",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint32",
          name: "eid",
          type: "uint32",
        },
      ],
      name: "peers",
      outputs: [
        {
          internalType: "bytes32",
          name: "peer",
          type: "bytes32",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "_dstBuyerAddress",
          type: "bytes32",
        },
        {
          components: [
            {
              internalType: "bytes32",
              name: "offerId",
              type: "bytes32",
            },
            {
              internalType: "uint64",
              name: "srcAmountSD",
              type: "uint64",
            },
            {
              internalType: "bytes32",
              name: "srcBuyerAddress",
              type: "bytes32",
            },
          ],
          internalType: "struct IOtcMarketAcceptOffer.AcceptOfferParams",
          name: "_params",
          type: "tuple",
        },
        {
          internalType: "bool",
          name: "_payInLzToken",
          type: "bool",
        },
      ],
      name: "quoteAcceptOffer",
      outputs: [
        {
          components: [
            {
              internalType: "uint256",
              name: "nativeFee",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "lzTokenFee",
              type: "uint256",
            },
          ],
          internalType: "struct MessagingFee",
          name: "fee",
          type: "tuple",
        },
        {
          components: [
            {
              internalType: "uint256",
              name: "dstAmountLD",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "feeLD",
              type: "uint256",
            },
          ],
          internalType: "struct IOtcMarketAcceptOffer.AcceptOfferReceipt",
          name: "acceptOfferReceipt",
          type: "tuple",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "_offerId",
          type: "bytes32",
        },
      ],
      name: "quoteCancelOffer",
      outputs: [
        {
          components: [
            {
              internalType: "uint256",
              name: "nativeFee",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "lzTokenFee",
              type: "uint256",
            },
          ],
          internalType: "struct MessagingFee",
          name: "fee",
          type: "tuple",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "_srcSellerAddress",
          type: "bytes32",
        },
        {
          internalType: "bytes32",
          name: "_offerId",
          type: "bytes32",
        },
        {
          internalType: "bytes",
          name: "_extraSendOptions",
          type: "bytes",
        },
        {
          internalType: "bool",
          name: "_payInLzToken",
          type: "bool",
        },
      ],
      name: "quoteCancelOfferOrder",
      outputs: [
        {
          components: [
            {
              internalType: "uint256",
              name: "nativeFee",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "lzTokenFee",
              type: "uint256",
            },
          ],
          internalType: "struct MessagingFee",
          name: "fee",
          type: "tuple",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "_srcSellerAddress",
          type: "bytes32",
        },
        {
          components: [
            {
              internalType: "bytes32",
              name: "dstSellerAddress",
              type: "bytes32",
            },
            {
              internalType: "uint32",
              name: "dstEid",
              type: "uint32",
            },
            {
              internalType: "bytes32",
              name: "srcTokenAddress",
              type: "bytes32",
            },
            {
              internalType: "bytes32",
              name: "dstTokenAddress",
              type: "bytes32",
            },
            {
              internalType: "uint256",
              name: "srcAmountLD",
              type: "uint256",
            },
            {
              internalType: "uint64",
              name: "exchangeRateSD",
              type: "uint64",
            },
          ],
          internalType: "struct IOtcMarketCreateOffer.CreateOfferParams",
          name: "_params",
          type: "tuple",
        },
        {
          internalType: "bool",
          name: "_payInLzToken",
          type: "bool",
        },
      ],
      name: "quoteCreateOffer",
      outputs: [
        {
          components: [
            {
              internalType: "uint256",
              name: "nativeFee",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "lzTokenFee",
              type: "uint256",
            },
          ],
          internalType: "struct MessagingFee",
          name: "fee",
          type: "tuple",
        },
        {
          components: [
            {
              internalType: "bytes32",
              name: "offerId",
              type: "bytes32",
            },
            {
              internalType: "uint256",
              name: "srcAmountLD",
              type: "uint256",
            },
          ],
          internalType: "struct IOtcMarketCreateOffer.CreateOfferReceipt",
          name: "createOfferReceipt",
          type: "tuple",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "renounceOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "_delegate",
          type: "address",
        },
      ],
      name: "setDelegate",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          components: [
            {
              internalType: "uint32",
              name: "eid",
              type: "uint32",
            },
            {
              internalType: "uint16",
              name: "msgType",
              type: "uint16",
            },
            {
              internalType: "bytes",
              name: "options",
              type: "bytes",
            },
          ],
          internalType: "struct EnforcedOptionParam[]",
          name: "_enforcedOptions",
          type: "tuple[]",
        },
      ],
      name: "setEnforcedOptions",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint32",
          name: "_eid",
          type: "uint32",
        },
        {
          internalType: "bytes32",
          name: "_peer",
          type: "bytes32",
        },
      ],
      name: "setPeer",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "_treasury",
          type: "address",
        },
      ],
      name: "setTreasury",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "newOwner",
          type: "address",
        },
      ],
      name: "transferOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "treasury",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
  ],
  contractAddress: "TTbdwtdNTBC2z6QqNLCF7f1Cy4TxfyNj2X",
};
