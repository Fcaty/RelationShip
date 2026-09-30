import Logo from './logo';
import Navig from './navig';

export default function Header({ variant }) {
  return (
    <header
      className="w-full h-24 min-h-24 px-7 py-3.5 bg-linear-to-r from-n from-30% to-b border-b-2 border-p flex justify-between items-center overflow-hidden"
    >
      <div className="header-logo flex items-center">
        <Logo />
      </div>
      <Navig variant={variant} />
    </header>
  );
}