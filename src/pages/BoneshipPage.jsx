import React, { useEffect, useState } from 'react';
import { useAccount, useContractRead } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { formatUnits } from 'ethers/lib/utils';
import { useLocation } from 'react-router-dom';

import Boneship from '../components/Boneship';
import doodIcon from '../assets/dood-icon.png';

const tokenAddress = '0x5AE76910cfd1fE3a75902C0a0BEaA7C9B9deAFc8';

const tokenAbi = [
  {
    constant: true,
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
];

function BoneshipPage() {
  const { address, isConnected } = useAccount();
  const [displayBalance, setDisplayBalance] = useState('');
  const [expanded, setExpanded] = useState(false);

  const { data } = useContractRead({
    addressOrName: tokenAddress,
    contractInterface: tokenAbi,
    functionName: 'balanceOf',
    args: [address],
    watch: true,
    enabled: Boolean(address),
  });

  useEffect(() => {
    if (data) {
      const raw = formatUnits(data, 18);
      const num = parseFloat(raw);

      const formatShort = (val, suffix) =>
        val.toFixed(3).replace(/\.0+$/, '').replace(/(\.\d*[1-9])0+$/, '$1') + suffix;

      if (expanded) {
        setDisplayBalance(raw);
      } else {
        if (num >= 1_000_000_000_000) setDisplayBalance(formatShort(num / 1_000_000_000_000, 'T'));
        else if (num >= 1_000_000_000) setDisplayBalance(formatShort(num / 1_000_000_000, 'B'));
        else if (num >= 1_000_000) setDisplayBalance(formatShort(num / 1_000_000, 'M'));
        else if (num >= 1_000) setDisplayBalance(formatShort(num / 1_000, 'K'));
        else setDisplayBalance(raw);
      }
    }
  }, [data, expanded]);

  return (
    <div className="bg-black text-white w-screen h-screen flex flex-col overflow-hidden">
      {/* ✅ Custom Header */}
      <header className="w-full h-[240px] relative overflow-hidden">
        <img
          src="/boneship-header.png"
          alt="Boneship Header"
          className="w-full h-full object-cover"
        />

        <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white p-4 z-10">
          {/* Nav */}
          <div className="absolute top-4 left-4 z-20 flex gap-4 font-semibold text-lg md:text-xl font-fredoka">
  {['/', '/burn', '/boneship'].map((path, i) => {
    const labels = ['Home', 'Burn', 'Boneship'];
    const isActive = location.pathname === path;

    return (
      <a
        key={path}
        href={path}
        className={`px-3 py-1 rounded transition ${
          location.pathname === '/boneship' ? 'text-black' : 'text-white hover:underline'
        }`}
      >
        {labels[i]}
      </a>
    );
  })}
</div>


          {/* Wallet Info */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-4">
            {isConnected && displayBalance && (
              <div
                onClick={() => setExpanded((prev) => !prev)}
                className="flex items-center bg-white text-black border-2 border-white rounded-[var(--rk-radii-connectButton)] px-4 py-[10px] font-bold text-base h-12 gap-3 cursor-pointer"
              >
                <img src={doodIcon} alt="$DOOD" className="w-11 h-11" />
                {displayBalance} DOOD
              </div>
            )}
            <div className="scale-110">
              <ConnectButton showBalance={false} />
            </div>
          </div>

          <h1
  className="text-7xl font-bold mb-2"
  style={{
    color: 'black', // or your preferred color
    WebkitTextStroke: '0', // No outline
    fontFamily: "'Fredoka', sans-serif",
  }}
>
  GOLD DOOD
</h1>

        </div>
      </header>

      {/* ✅ Game */}
      <main className="flex-1 flex items-center justify-center overflow-hidden">
        <Boneship />
      </main>

      {/* ✅ Custom Footer */}
      <footer className="w-full h-[240px] overflow-hidden relative">
        <img
          src="/boneship-footer.png"
          alt="Boneship Footer"
          className="w-full h-full object-cover"
        />
      </footer>
    </div>
  );
}

export default BoneshipPage;
