import { useLocation } from 'react-router-dom';
import useScrollFadeIn from '../hooks/useScrollFadeIn';
import defaultFooterImg from '../assets/footer.png';
import burnFooterImg from '../assets/footer-burn.png';

function Footer() {
  const fadeIn = useScrollFadeIn();
const location = useLocation();

  const isBurnPage = location.pathname === '/burn';
  const footerImg = isBurnPage ? burnFooterImg : defaultFooterImg;
  return (
    <footer className="relative w-full h-[240px] mt-10 overflow-hidden font-fredoka">
      {/* Background Image */}
      <img
        src={footerImg}
        alt="Gold Dood Footer"
        className="w-full h-full object-cover"
      />

      {/* Overlay Content */}
      <div
        className="absolute inset-0 bg-black bg-opacity-60 text-white flex flex-col justify-between p-6 z-10"
        {...fadeIn}
      >
        <div className="flex justify-between items-center flex-wrap gap-4">
          {/* Left: Logo + Slogan */}
          <div>
            <h2 className="font-bold text-lg">GOLD DOOD</h2>
            <p className="text-sm">Stay Golden.</p>
          </div>

          {/* Center: Navigation */}
          <ul className="flex space-x-4 text-sm font-medium">
            <li><a href="#">Home</a></li>
            <li><a href="#">Tokenomics</a></li>
            <li><a href="#">Burn Tracker</a></li>
            <li><a href="#">NFTs</a></li>
            <li><a href="#">Roadmap</a></li>
          </ul>

          {/* Right: Socials */}
          <div className="flex space-x-4 text-white text-xl">
            <a href="#" aria-label="Twitter">🐦</a>
            <a href="#" aria-label="Telegram">💬</a>
            <a href="#" aria-label="Discord">🎮</a>
            <a href="#" aria-label="Reddit">👽</a>
          </div>
        </div>

        {/* Bottom Copyright */}
        <p className="text-center text-xs mt-4">© 2025 Gold Dood. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
