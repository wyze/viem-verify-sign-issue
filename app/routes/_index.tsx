import { useState } from "react";
import {
  Address,
  createPublicClient,
  createWalletClient,
  custom,
  http,
} from "viem";
import { goerli } from "viem/chains";
import "viem/window";

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
  const [valid, setValid] = useState<boolean>();

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

            setValid(
              await publicClient.verifyMessage({
                address: account,
                message,
                signature,
              })
            );
          }}
        >
          Sign Message
        </button>
        {valid !== undefined ? <div>Valid: {valid ? "Yes" : "No"}</div> : null}
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
