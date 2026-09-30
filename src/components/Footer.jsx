import Logo from './logo';
import Navig from './navig';
import emailIcon from '../assets/email.svg';
import locationIcon from '../assets/location.svg';
import phoneIcon from '../assets/phone.svg';

export default function Footer() {
    return (
        <footer
            data-type="footer"
            className="mt-auto w-full self-stretch min-h-24 px-6 py-6 sm:px-12 bg-linear-to-r from-n from-30% to-g border-t-2 border-p flex flex-col justify-center items-start gap-5 overflow-hidden"
        >
            <div className="flex w-full flex-col gap-8 md:flex-row md:justify-between">
                <section className="flex w-full max-w-md flex-col gap-5">
                    <Logo />

                    <div className="h-0 w-full border-t-2 border-b" />

                    <address className="flex flex-col gap-3 py-2.5 not-italic text-w">
                        <div className="flex min-w-0 items-center gap-2.5">
                            <img src={phoneIcon} alt="" aria-hidden="true" className="h-5 w-5 shrink-0 object-contain" />
                            <span className="font-moderustic text-base">0915-967-8871</span>
                        </div>

                        <div className="flex min-w-0 items-center gap-2.5">
                            <img src={emailIcon} alt="" aria-hidden="true" className="h-5 w-5 shrink-0 object-contain" />
                            <span className="break-all font-moderustic text-base">relation.ship@gmail.com</span>
                        </div>

                        <div className="flex min-w-0 items-start gap-2.5">
                            <img src={locationIcon} alt="" aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 object-contain" />
                            <span className="font-moderustic text-base">#50 Maestrang Kikay, Talavera<br />Nueva Ecija, Philippines 3114</span>
                        </div>
                    </address>
                </section>

                <section className="flex flex-1 flex-col items-start gap-2.5 md:items-end">
                    <h2 className="text-2xl font-semibold text-w">Quicklinks</h2>
                    <Navig
                        variant="guest"
                        className="flex flex-col items-start gap-1 md:items-end"
                        ariaLabel="Footer quick links"
                    />
                </section>
            </div>

            <p className="font-moderustic text-base text-w">© 2026 Alindogan-Bustos-Delos Santos. All rights reserved.</p>
        </footer>
    );
}