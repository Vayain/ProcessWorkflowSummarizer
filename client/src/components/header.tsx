import logoSvg from "../assets/logo.svg";

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-neutral-50 to-neutral-100 border-b border-neutral-200 px-4 py-3">
      <div className="flex items-center">
        <img src={logoSvg} alt="SCS Logo" className="h-8 w-8 mr-3" />
        <h1 className="text-xl font-semibold text-primary-600">
          SCS
        </h1>
      </div>
    </header>
  );
}
