import { useLocation, Link } from 'react-router-dom';
import Starfield from './Starfield';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useContractRead } from 'wagmi';
import { formatUnits } from 'ethers/lib/utils';
import { useEffect, useState } from 'react';
import useScrollFadeIn from '../hooks/useScrollFadeIn';

import defaultHeaderImg from '../assets/header.png';
import burnHeaderImg from '../assets/burn-header.png';
import boneshipHeaderImg from '/boneship-header.png'; // ✅ from public folder
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

function Header() {
  const location = useLocation();
  const fadeIn = useScrollFadeIn();
  const { address, isConnected } = useAccount();
  const [fullBalance, setFullBalance] = useState(null);
  const [displayBalance, setDisplayBalance] = useState('');
  const [expanded, setExpanded] = useState(false);

  const isBurnPage = location.pathname === '/burn';
  const isBoneshipPage = location.pathname === '/boneship';

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
    setFullBalance(raw);

    const num = parseFloat(raw);
    if (!expanded) {
      const formatShort = (val, suffix) => {
        const shortened = (val).toFixed(3).replace(/\.0+$/, '').replace(/(\.\d*[1-9])0+$/, '$1');
        return shortened + suffix;
      };

      if (num >= 1_000_000_000_000) setDisplayBalance(formatShort(num / 1_000_000_000_000, 'T'));
      else if (num >= 1_000_000_000) setDisplayBalance(formatShort(num / 1_000_000_000, 'B'));
      else if (num >= 1_000_000) setDisplayBalance(formatShort(num / 1_000_000, 'M'));
      else if (num >= 1_000) setDisplayBalance(formatShort(num / 1_000, 'K'));
      else setDisplayBalance(raw);
    } else {
      setDisplayBalance(raw);
    }
  }
}, [data, expanded]);


  const toggleExpand = () => {
    setExpanded((prev) => !prev);
  };

  const headerImage = isBoneshipPage
    ? boneshipHeaderImg
    : isBurnPage
    ? burnHeaderImg
    : defaultHeaderImg;

  const textColor = isBurnPage ? '#ff0000' : isBoneshipPage ? 'black' : 'black';
  const strokeColor = isBurnPage ? '4px orange' : isBoneshipPage ? '2px orange' : '0';

  return (
    <div className="relative w-full h-[240px] overflow-hidden font-fredoka">
      <img
        src={headerImage}
        alt="Header"
        className="w-full h-full object-cover"
      />
      <Starfield />

      <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white p-4 z-10">
        {/* Navigation Links */}
        <div className="absolute top-4 left-4 z-20 flex gap-6 text-white font-semibold text-lg md:text-xl">
          <Link to="/">Home</Link>
          <Link to="/burn">Burn</Link>
          <Link to="/boneship">Boneship</Link>
        </div>

        {/* Wallet / Balance */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-4">
          {isConnected && displayBalance && (
            <div
              onClick={toggleExpand}
              className="flex items-center bg-[var(--rk-colors-connectButtonBackground)] border-2 border-[var(--rk-colors-connectButtonBackground)] rounded-[var(--rk-radii-connectButton)] px-4 py-[10px] text-[var(--rk-colors-connectButtonText)] font-bold text-base h-12 gap-3 cursor-pointer"
              style={{ fontFamily: 'var(--rk-fonts-body)' }}
              title={expanded ? 'Click to shorten' : 'Click to expand'}
            >
              <img src={doodIcon} alt="$DOOD" className="w-11 h-11" />
              {displayBalance} DOOD
            </div>
          )}
          <div className="scale-110">
            <ConnectButton showBalance={false} />
          </div>
        </div>

        {/* Title */}
        <div {...fadeIn} className="mt-4">
          <h1
            className="text-7xl font-bold mb-2"
            style={{
              fontFamily: "'Fredoka', sans-serif",
              color: textColor,
              WebkitTextStroke: strokeColor,
            }}
          >
            GOLD DOOD
          </h1>
        </div>
      </div>
    </div>
  );
}

export default Header;
