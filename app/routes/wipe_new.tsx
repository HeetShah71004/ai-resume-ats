import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { usePuterStore } from "~/lib/puter";

export const meta = () => [
  { title: "ResumeRx | Wipe Data" },
  { name: "description", content: "Wipe all application data" },
];

const WipeApp = () => {
  const { auth, isLoading, error, clearError, fs, ai, kv } = usePuterStore();
  const navigate = useNavigate();
  const [files, setFiles] = useState<FSItem[]>([]);
  const [isWiping, setIsWiping] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [wipeComplete, setWipeComplete] = useState(false);
  const [wipeType, setWipeType] = useState<"data-only" | "data-and-logout">(
    "data-only"
  );

  const loadFiles = async () => {
    try {
      const files = (await fs.readDir("./")) as FSItem[];
      setFiles(files);
    } catch (err) {
      console.error("Failed to load files:", err);
    }
  };

  useEffect(() => {
    if (auth.isAuthenticated) {
      loadFiles();
    }
  }, [auth.isAuthenticated]);

  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated) {
      navigate("/auth?next=/wipe");
    }
  }, [isLoading, auth.isAuthenticated, navigate]);

  const handleWipeDataOnly = async () => {
    setIsWiping(true);
    try {
      // Delete all files
      for (const file of files) {
        await fs.delete(file.path);
      }
      // Clear key-value store
      await kv.flush();

      setWipeComplete(true);

      // Auto-navigate to home after showing success message
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      console.error("Failed to wipe data:", err);
    } finally {
      setIsWiping(false);
    }
  };

  const handleWipeAndLogout = async () => {
    setIsWiping(true);
    try {
      // Delete all files
      for (const file of files) {
        await fs.delete(file.path);
      }
      // Clear key-value store
      await kv.flush();
      // Sign out
      await auth.signOut();
      // Navigate to home
      navigate("/");
    } catch (err) {
      console.error("Failed to wipe data:", err);
    } finally {
      setIsWiping(false);
    }
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

  if (error) {
    return (
      <main className="bg-[url('/images/bg-auth.svg')] bg-cover min-h-screen flex items-center justify-center">
        <div className="gradient-border shadow-lg">
          <section className="flex flex-col gap-8 bg-white rounded-2xl p-10">
            <div className="text-center">
              <h1>Error</h1>
              <p className="text-red-600">{error}</p>
            </div>
            <button className="auth-button" onClick={() => navigate("/")}>
              <p>Go Home</p>
            </button>
          </section>
        </div>
      </main>
    );
  }

  // Show success message after wipe
  if (wipeComplete) {
    return (
      <main className="bg-[url('/images/bg-auth.svg')] bg-cover min-h-screen flex items-center justify-center">
        <div className="gradient-border shadow-lg">
          <section className="flex flex-col gap-8 bg-white rounded-2xl p-10">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="text-6xl">✅</div>
              <h1>Data Wiped Successfully!</h1>
              <h2 className="text-green-600">All your data has been cleared</h2>
              <p className="text-gray-600">
                Redirecting you to the home page...
              </p>
            </div>
          </section>
        </div>
      </main>
    );
  }

  if (!showConfirmation) {
    return (
      <main className="bg-[url('/images/bg-auth.svg')] bg-cover min-h-screen flex items-center justify-center">
        <div className="gradient-border shadow-lg">
          <section className="flex flex-col gap-8 bg-white rounded-2xl p-10 max-w-2xl">
            <div className="flex flex-col items-center gap-2 text-center">
              <h1>⚠️ Wipe App Data</h1>
              <h2>Choose how to clear your data</h2>
              <p className="text-gray-600">
                Logged in as: {auth.user?.username}
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-800 mb-2">
                Files to be deleted ({files.length}):
              </h3>
              {files.length > 0 ? (
                <div className="max-h-40 overflow-y-auto">
                  {files.map((file) => (
                    <div key={file.id} className="text-sm text-yellow-700 py-1">
                      📄 {file.name}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-yellow-700 text-sm">No files found</p>
              )}
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">
                <strong>Warning:</strong> This action cannot be undone. All your
                resumes, analysis results, and stored data will be permanently
                deleted.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="wipeType"
                    value="data-only"
                    checked={wipeType === "data-only"}
                    onChange={(e) =>
                      setWipeType(
                        e.target.value as "data-only" | "data-and-logout"
                      )
                    }
                    className="text-blue-600"
                  />
                  <div>
                    <div className="font-semibold">Wipe Data Only</div>
                    <div className="text-sm text-gray-600">
                      Clear all data but stay logged in
                    </div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="wipeType"
                    value="data-and-logout"
                    checked={wipeType === "data-and-logout"}
                    onChange={(e) =>
                      setWipeType(
                        e.target.value as "data-only" | "data-and-logout"
                      )
                    }
                    className="text-blue-600"
                  />
                  <div>
                    <div className="font-semibold">Wipe Data & Logout</div>
                    <div className="text-sm text-gray-600">
                      Clear all data and sign out
                    </div>
                  </div>
                </label>
              </div>

              <button
                className="bg-red-500 hover:bg-red-600 text-white rounded-full py-4 px-8 cursor-pointer w-full text-xl font-semibold transition-colors"
                onClick={() => setShowConfirmation(true)}
              >
                Continue to Wipe Data
              </button>

              <button
                className="bg-gray-500 hover:bg-gray-600 text-white rounded-full py-2 px-6 cursor-pointer w-full transition-colors"
                onClick={() => navigate("/")}
              >
                Cancel & Go Back
              </button>
            </div>
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
            <h1>🗑️ Final Confirmation</h1>
            <h2>Are you absolutely sure?</h2>
            <p className="text-red-600 font-semibold">
              {wipeType === "data-only"
                ? "This will delete ALL your data!"
                : "This will delete ALL your data and log you out!"}
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {isWiping ? (
              <button className="auth-button animate-pulse" disabled>
                <p>
                  {wipeType === "data-only"
                    ? "Wiping data..."
                    : "Wiping data and logging out..."}
                </p>
              </button>
            ) : (
              <>
                <button
                  className="bg-red-600 hover:bg-red-700 text-white rounded-full py-4 px-8 cursor-pointer w-full text-xl font-semibold transition-colors"
                  onClick={
                    wipeType === "data-only"
                      ? handleWipeDataOnly
                      : handleWipeAndLogout
                  }
                >
                  {wipeType === "data-only"
                    ? "Yes, Wipe Data Only"
                    : "Yes, Wipe Everything & Logout"}
                </button>

                <button
                  className="bg-gray-500 hover:bg-gray-600 text-white rounded-full py-2 px-6 cursor-pointer w-full transition-colors"
                  onClick={() => setShowConfirmation(false)}
                >
                  No, Cancel
                </button>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
};

export default WipeApp;
