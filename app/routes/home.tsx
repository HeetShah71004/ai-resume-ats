import type { Route } from "./+types/home";
import Navbar from "~/components/Navbar";
import ResumeCard from "~/components/ResumeCard";
import { usePuterStore } from "~/lib/puter";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useEffect, useState } from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "ResumeRx" },
    { name: "description", content: "Smart feedback for your dream job!" },
  ];
}

export default function Home() {
  const { auth, kv } = usePuterStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(false);
  const [showWipeSuccess, setShowWipeSuccess] = useState(false);

  useEffect(() => {
    if (!auth.isAuthenticated) navigate("/auth?next=/");
  }, [auth.isAuthenticated]);

  useEffect(() => {
    // Check if coming back from a successful wipe
    if (searchParams.get("wiped") === "true") {
      setShowWipeSuccess(true);
      // Clear the parameter from URL
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete("wiped");
      navigate({ search: newSearchParams.toString() }, { replace: true });

      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowWipeSuccess(false);
      }, 3000);
    }
  }, [searchParams, navigate]);

  useEffect(() => {
    const loadResumes = async () => {
      setLoadingResumes(true);

      const resumes = (await kv.list("resume:*", true)) as KVItem[];

      const parsedResumes = resumes?.map(
        (resume) => JSON.parse(resume.value) as Resume
      );

      setResumes(parsedResumes || []);
      setLoadingResumes(false);
    };

    if (auth.isAuthenticated) {
      loadResumes();
    }
  }, [auth.isAuthenticated, kv]);

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
      <Navbar />

      {/* Wipe Success Notification */}
      {showWipeSuccess && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
          <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3">
            <span className="text-xl">✅</span>
            <div>
              <div className="font-semibold">Data Wiped Successfully!</div>
              <div className="text-sm opacity-90">
                All your data has been cleared
              </div>
            </div>
          </div>
        </div>
      )}

      <section className="main-section">
        <div className="page-heading py-16">
          <h1>Track Your Applications & Resume Ratings</h1>
          {loadingResumes ? (
            <div className="flex items-center gap-3">
              <div className="loading-dots">
                <div></div>
                <div></div>
                <div></div>
              </div>
              <h2>Loading your resumes...</h2>
            </div>
          ) : resumes?.length === 0 ? (
            <h2>No resumes found. Upload your first resume to get feedback.</h2>
          ) : (
            <h2>Review your submissions and check AI-powered feedback.</h2>
          )}
        </div>
        <div className="resumes-section">
          {loadingResumes
            ? // Skeleton loading cards
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="resume-card-skeleton">
                  <div className="skeleton-header">
                    <div className="skeleton-image"></div>
                    <div className="skeleton-text-group">
                      <div className="skeleton-line skeleton-line-title"></div>
                      <div className="skeleton-line skeleton-line-subtitle"></div>
                    </div>
                  </div>
                  <div className="skeleton-content">
                    <div className="skeleton-score-circle"></div>
                    <div className="skeleton-feedback">
                      <div className="skeleton-line skeleton-line-full"></div>
                      <div className="skeleton-line skeleton-line-medium"></div>
                      <div className="skeleton-line skeleton-line-short"></div>
                    </div>
                  </div>
                </div>
              ))
            : resumes.length > 0
              ? resumes.map((resume) => (
                  <ResumeCard key={resume.id} resume={resume} />
                ))
              : null}
        </div>

        {!loadingResumes && resumes?.length === 0 && (
          <div className="flex flex-col items-center justify-center mt-10 gap-4">
            <Link
              to="/upload"
              className="primary-button w-fit text-xl font-semibold"
            >
              Upload Resume
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
