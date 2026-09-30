import shipLogo from '../assets/ship.svg';

export default function Logo() {
  return (
    <div className="inline-flex flex-col justify-center items-start gap-1 text-w">
      <div className="inline-flex justify-start items-center gap-2.5">
        <img src={shipLogo} alt="RelationShip ship logo" className="w-10 h-10 object-contain" />
        <h1>RelationShip</h1>
      </div>
      <h4>Para sa mga lumayag</h4>
    </div>
  );
}

