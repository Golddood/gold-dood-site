import { useAccount, useContractWrite } from 'wagmi';
import { useState } from 'react';
import { utils } from 'ethers';
import useScrollFadeIn from '../hooks/useScrollFadeIn';

const tokenAddress = '0x5AE76910cfd1fE3a75902C0a0BEaA7C9B9deAFc8';
const burnAddress = '0x000000000000000000000000000000000000dEaD';

const abi = [
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'recipient', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
];

function BurnSection() {
  const fadeIn = useScrollFadeIn();
  const { isConnected } = useAccount();
  const [amount, setAmount] = useState('');
  const [txData, setTxData] = useState(null);
  const [errorText, setErrorText] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [burnValue, setBurnValue] = useState(null);

  const {
  write,
  data,
  isLoading,
  isSuccess,
  error,
} = useContractWrite({
  addressOrName: tokenAddress,
  contractInterface: abi,
  functionName: 'transfer',
  onSuccess: (tx) => {
    setTxData(tx);
    setAmount('');
  },
  onError: (err) => {
    const isRejected =
      err?.code === 'ACTION_REJECTED' ||
      err?.message?.toLowerCase().includes('user rejected');
    setErrorText(isRejected ? '⚠️ Request declined' : `⚠️ ${err.message}`);
    setShowConfirm(false);
  },
});

  const handleBurnClick = () => {
    try {
      if (!amount || parseFloat(amount) <= 0) {
        throw new Error('⚠️ Enter an amount greater than 0.');
      }
      const parsed = utils.parseUnits(amount.trim(), 18);
      setBurnValue(parsed);
      setErrorText('');
      setShowConfirm(true);
    } catch (err) {
      setErrorText(err.message);
    }
  };

  const confirmBurn = () => {
    if (write && burnValue) {
      write({ args: [burnAddress, burnValue] });
    }
    setShowConfirm(false);
  };

  return (
   <section className="bg-black text-white py-12 px-6 text-center relative max-h-[calc(100vh-240px)] overflow-y-auto" {...fadeIn}>
  <h2 className="text-5xl font-bold mb-8"> Burn Your DOOD</h2>
  <p className="mb-10 text-base max-w-3xl mx-auto leading-relaxed">
    Send your tokens to the eternal fire. Every burn tightens supply and strengthens the pack.
  </p>

      <div className="flex justify-center items-center flex-wrap gap-6 mb-6">
  <input
    type="number"
    inputMode="decimal"
    min="0"
    step="any"
    placeholder="Amount to burn"
    className="text-black px-4 py-2 rounded w-64"
    value={amount}
    onChange={(e) => setAmount(e.target.value)}
    onKeyDown={(e) => {
      if (
        ['e', 'E', '+', '-', ','].includes(e.key) ||
        (e.key === '.' && e.target.value.includes('.'))
      ) {
        e.preventDefault();
      }
    }}
  />
  <button
    onClick={handleBurnClick}
    disabled={!isConnected || isLoading}
    className="bg-red-600 hover:bg-red-700 px-6 py-4 rounded font-bold text-xl"
  >
    {isLoading ? 'Burning...' : 'Burn Now'}
  </button>
</div>

<p className="text-xs text-gray-400 max-w-xl mx-auto leading-relaxed mt-2">
  Burning DOOD permanently removes your tokens from circulation by sending them to a dead wallet (
  <code className="bg-gray-800 text-yellow-300 px-1 py-0.5 rounded">0x...dEaD</code>). This reduces total supply and helps boost token scarcity.
</p>

      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-[#111] border border-yellow-400 rounded-lg p-6 w-80 text-center shadow-2xl">
            <h3 className="text-xl font-bold mb-4 text-yellow-400">Confirm Burn</h3>
            <p className="text-sm text-gray-300 mb-6">
              Are you sure you want to burn{' '}
              <span className="text-red-400 font-bold">{amount} $DOOD</span>?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 border border-gray-400 text-gray-300 rounded hover:bg-gray-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmBurn}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
              >
                Burn
              </button>
            </div>
          </div>
        </div>
      )}

      {isSuccess && data?.hash && (
        <p className="mt-4 text-green-400">
          🔥 Burn successful!{' '}
          <a
            href={`https://bscscan.com/tx/${data.hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-blue-400"
          >
            View on BscScan
          </a>
        </p>
      )}

      {(error || errorText) && (
        <p className="mt-4 text-red-400">{errorText || `⚠️ ${error.message}`}</p>
      )}
    </section>
  );
}

export default BurnSection;
