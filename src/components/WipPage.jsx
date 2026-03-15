import { Link } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import Button from "./Button.jsx";

function WipPage({ title = "Work In Progress", message, showPortalLink = true }) {
  return (
    <div className="min-h-screen bg-background text-on-surface">
      <Navbar showFloatingNav />
      <main className="mx-auto flex min-h-[70vh] max-w-4xl flex-col items-center justify-center px-6 pb-24 pt-28 text-center">
        <span className="mb-4 font-label text-xs uppercase tracking-[0.3em] text-on-surface-variant">
          Work In Progress
        </span>
        <h1 className="mb-4 font-headline text-4xl font-bold md:text-5xl">
          {title}
        </h1>
        <p className="max-w-xl text-on-surface-variant">
          {message ||
            "This section is being built. Soon you will be able to access the full experience."}
        </p>
        {showPortalLink ? (
          <Link className="mt-8" to="/choose-path">
            <Button className="px-6 py-3">Back to Portal</Button>
          </Link>
        ) : null}
      </main>
    </div>
  );
}

export default WipPage;
