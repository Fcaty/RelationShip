import shipLogo from '../assets/ship.svg';

export default function Logo() {
  return (
    <div className="inline-flex flex-col justify-center items-start gap-1 text-w">
      <div className="inline-flex justify-start items-center gap-2.5">
        <img src={shipLogo} alt="RelationShip ship logo" className="w-10 h-10 object-contain" />
        <span className="text-2xl font-aclonica">RelationShip</span>
      </div>
      <p className="m-0 text-sm font-medium font-moderustic">Para sa mga lumayag</p>
    </div>
  );
}

