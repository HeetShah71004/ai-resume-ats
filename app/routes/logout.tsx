import { useEffect } from "react";
import { useNavigate } from "react-router";
import { usePuterStore } from "~/lib/puter";

export const meta = () => [
  { title: "ResumeRx | Logout" },
  { name: "description", content: "Logout from your account" },
];

const Logout = () => {
  const { auth, isLoading, error } = usePuterStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated) {
      // If not authenticated, redirect to home
      navigate("/");
    }
  }, [isLoading, auth.isAuthenticated, navigate]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleWipeData = () => {
    alert(
      "🔄 Wipe functionality has been moved to the user menu in the navigation bar. Please use the dropdown menu next to your username."
    );
    navigate("/");
  };

  if (isLoading) {
    return (
      <main className="bg-[url('/images/bg-auth.svg')] bg-cover min-h-screen flex items-center justify-center">
        <div className="gradient-border shadow-lg">
          <section className="flex flex-col gap-8 bg-white rounded-2xl p-10">
            <div className="animate-pulse text-center">
              <p>Loading...</p>
            </div>
          </section>
        </div>
      </main>
    );
  }

  if (!auth.isAuthenticated) {
    return (
      <main className="bg-[url('/images/bg-auth.svg')] bg-cover min-h-screen flex items-center justify-center">
        <div className="gradient-border shadow-lg">
          <section className="flex flex-col gap-8 bg-white rounded-2xl p-10">
            <div className="flex flex-col items-center gap-2 text-center">
              <h1>Not Logged In</h1>
              <h2>You are not currently logged in</h2>
            </div>
            <button className="auth-button" onClick={() => navigate("/")}>
              <p>Go Home</p>
            </button>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-[url('/images/bg-auth.svg')] bg-cover min-h-screen flex items-center justify-center">
      <div className="gradient-border shadow-lg">
        <section className="flex flex-col gap-8 bg-white rounded-2xl p-10">
          <div className="flex flex-col items-center gap-2 text-center">
            <h1>Logout</h1>
            <h2>Logged in as: {auth.user?.username}</h2>
            <p className="text-gray-600">Choose an option below</p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-4">
            <button className="auth-button" onClick={handleLogout}>
              <p>Logout</p>
            </button>

            <button
              className="bg-orange-500 hover:bg-orange-600 text-white rounded-full py-4 px-8 cursor-pointer w-full text-xl font-semibold transition-colors"
              onClick={handleWipeData}
            >
              <p>Logout & Wipe App Data</p>
            </button>

            <button
              className="bg-gray-500 hover:bg-gray-600 text-white rounded-full py-2 px-6 cursor-pointer w-full transition-colors"
              onClick={() => navigate("/")}
            >
              <p>Cancel</p>
            </button>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Logout;
