import { useState } from "react";
import {
  type Address,
  createPublicClient,
  createWalletClient,
  custom,
  http,
  verifyMessage,
} from "viem";
import { goerli } from "viem/chains";
import "viem/window";

type ValidState =
  | { state: "unverified" }
  | {
      state: "verified";
      data: {
        publicClient: boolean;
        utility: boolean;
      };
    };

const publicClient = createPublicClient({
  chain: goerli,
  transport: http(),
});

const walletClient = createWalletClient({
  chain: goerli,
  transport: typeof window !== "undefined" ? custom(window.ethereum!) : http(),
});

export default function Index() {
  const [account, setAccount] = useState<Address>();
  const [valid, setValid] = useState<ValidState>({ state: "unverified" });
  const [error, setError] = useState<Error>();

  if (account) {
    return (
      <>
        <div>Connected: {account}</div>
        <button
          onClick={async () => {
            const message = "Hello one, hello all!";
            const signature = await walletClient.signMessage({
              account,
              message,
            });

            try {
              setValid({
                state: "verified",
                data: {
                  publicClient: await publicClient.verifyMessage({
                    address: account,
                    message,
                    signature,
                  }),
                  utility: await verifyMessage({
                    address: account,
                    message,
                    signature,
                  }),
                },
              });
            } catch (error) {
              if (error instanceof Error) {
                setError(error);
              }
            }
          }}
        >
          Sign Message
        </button>
        {valid.state === "verified" ? (
          <>
            <div>
              Public Client Valid: {valid.data.publicClient ? "Yes" : "No"}
            </div>
            <div>Utility Valid: {valid.data.utility ? "Yes" : "No"}</div>
          </>
        ) : null}
        {typeof error !== "undefined" ? <pre>{error.stack}</pre> : null}
      </>
    );
  }

  return (
    <button
      onClick={async () => {
        const [address] = await walletClient.requestAddresses();

        setAccount(address);
      }}
    >
      Connect Wallet
    </button>
  );
}
