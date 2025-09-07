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
          <h1 className="animate-fade-in-up">
            Track Your Applications & Resume Ratings
          </h1>
          {loadingResumes ? (
            <div className="flex items-center gap-3 animate-fade-in">
              <div className="loading-spinner">
                <div className="spinner-ring"></div>
                <div className="spinner-ring"></div>
                <div className="spinner-ring"></div>
                <div className="spinner-ring"></div>
              </div>
              <h2 className="animate-pulse">Loading your resumes...</h2>
            </div>
          ) : resumes?.length === 0 ? (
            <h2 className="animate-fade-in-up delay-200">
              No resumes found. Upload your first resume to get feedback.
            </h2>
          ) : (
            <h2 className="animate-fade-in-up delay-200">
              Review your submissions and check AI-powered feedback.
            </h2>
          )}
        </div>
        <div className="resumes-section">
          {loadingResumes
            ? // Enhanced skeleton loading cards with staggered animations
              Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="resume-card-skeleton animate-fade-in-scale"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="skeleton-header">
                    <div className="skeleton-image animate-shimmer"></div>
                    <div className="skeleton-text-group">
                      <div className="skeleton-line skeleton-line-title animate-shimmer"></div>
                      <div className="skeleton-line skeleton-line-subtitle animate-shimmer"></div>
                    </div>
                  </div>
                  <div className="skeleton-content">
                    <div className="skeleton-score-circle animate-shimmer animate-pulse-slow"></div>
                    <div className="skeleton-feedback">
                      <div className="skeleton-line skeleton-line-full animate-shimmer"></div>
                      <div className="skeleton-line skeleton-line-medium animate-shimmer"></div>
                      <div className="skeleton-line skeleton-line-short animate-shimmer"></div>
                    </div>
                  </div>
                  {/* Loading progress indicator */}
                  <div className="loading-progress-bar">
                    <div className="loading-progress-fill"></div>
                  </div>
                </div>
              ))
            : resumes.length > 0
              ? resumes.map((resume, index) => (
                  <div
                    key={resume.id}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <ResumeCard resume={resume} />
                  </div>
                ))
              : null}
        </div>

        {!loadingResumes && resumes?.length === 0 && (
          <div className="flex flex-col items-center justify-center mt-10 gap-4 animate-fade-in-up delay-300">
            <div className="text-6xl mb-4 animate-bounce-slow">📄</div>
            <p className="text-gray-600 text-lg mb-6 text-center max-w-md">
              Ready to get AI-powered feedback on your resume? Upload your first
              resume to get started!
            </p>
            <Link
              to="/upload"
              className="primary-button w-fit text-xl font-semibold transform hover:scale-105 transition-all duration-200 animate-pulse-button"
            >
              Upload Resume
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
