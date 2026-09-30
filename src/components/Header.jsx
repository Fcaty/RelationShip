import Logo from './logo';
import Navig from './navig';

export default function Header({ variant }) {
  return (
    <header
      className="w-full h-24 min-h-24 px-7 py-3.5 bg-gradient-to-r from-[var(--color-n)] from-30% to-[var(--color-b)] border-b-2 border-[var(--color-p)] flex justify-between items-center overflow-hidden"
    >
      <div className="header-logo flex items-center">
        <Logo />
      </div>
      <Navig variant={variant} />
    </header>
  );
}