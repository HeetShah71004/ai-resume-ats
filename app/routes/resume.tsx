import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import ATS from "~/components/ATS";
import Details from "~/components/Details";
import Summary from "~/components/Summary";
import { usePuterStore } from "~/lib/puter";

export const meta = () => [
  { title: "ResumeRx | Review " },
  { name: "description", content: "Detailed overview of your resume" },
];

const resume = () => {
  const { auth, isLoading, fs, kv } = usePuterStore();
  const { id } = useParams();
  const [imageUrl, setImageUrl] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showDownloadOptions) {
        setShowDownloadOptions(false);
      }
    };

    if (showDownloadOptions) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [showDownloadOptions]);

  const generateReportHTML = () => {
    if (!feedback) return "";

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Resume Analysis Report</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 40px; background: #f8fafc; }
        .container { max-width: 800px; margin: 0 auto; background: white; border-radius: 16px; padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #e5e7eb; padding-bottom: 30px; }
        .logo { font-size: 32px; font-weight: bold; color: #1f2937; margin-bottom: 10px; }
        .subtitle { color: #6b7280; font-size: 16px; }
        .score-section { text-align: center; margin: 40px 0; }
        .overall-score { font-size: 64px; font-weight: bold; color: #3b82f6; margin: 20px 0; }
        .score-label { font-size: 24px; color: #374151; margin-bottom: 10px; }
        .categories { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 40px 0; }
        .category { background: #f9fafb; padding: 20px; border-radius: 12px; border-left: 4px solid #3b82f6; }
        .category-name { font-weight: bold; color: #374151; margin-bottom: 8px; }
        .category-score { font-size: 24px; font-weight: bold; color: #3b82f6; }
        .ats-section { background: #ecfdf5; padding: 30px; border-radius: 12px; margin: 30px 0; border: 2px solid #10b981; }
        .ats-title { font-size: 24px; font-weight: bold; color: #065f46; margin-bottom: 15px; }
        .ats-score { font-size: 36px; font-weight: bold; color: #059669; margin-bottom: 10px; }
        .tips-section { margin: 30px 0; }
        .tips-title { font-size: 20px; font-weight: bold; color: #374151; margin-bottom: 15px; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; }
        .tip { margin: 10px 0; padding: 12px; border-radius: 8px; }
        .tip-good { background: #ecfdf5; border-left: 4px solid #10b981; }
        .tip-improve { background: #fef2f2; border-left: 4px solid #ef4444; }
        .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
        @media print { body { background: white; } .container { box-shadow: none; } }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">ResumeRx</div>
          <div class="subtitle">AI-Powered Resume Analysis Report</div>
        </div>
        
        <div class="score-section">
          <div class="score-label">Overall Resume Score</div>
          <div class="overall-score">${feedback.overallScore}/100</div>
        </div>

        <div class="categories">
          <div class="category">
            <div class="category-name">Tone & Style</div>
            <div class="category-score">${feedback.toneAndStyle.score}/100</div>
          </div>
          <div class="category">
            <div class="category-name">Content</div>
            <div class="category-score">${feedback.content.score}/100</div>
          </div>
          <div class="category">
            <div class="category-name">Structure</div>
            <div class="category-score">${feedback.structure.score}/100</div>
          </div>
          <div class="category">
            <div class="category-name">Skills</div>
            <div class="category-score">${feedback.skills.score}/100</div>
          </div>
        </div>

        <div class="ats-section">
          <div class="ats-title">ATS Compatibility Score</div>
          <div class="ats-score">${feedback.ATS.score}/100</div>
          <p>This score represents how well your resume is likely to perform in Applicant Tracking Systems used by employers.</p>
        </div>

        <div class="tips-section">
          <div class="tips-title">Detailed Feedback</div>
          
          <h3>Content Recommendations:</h3>
          ${feedback.content.tips
            .map(
              (tip) => `
            <div class="tip ${tip.type === "good" ? "tip-good" : "tip-improve"}">
              <strong>${tip.type === "good" ? "✓" : "⚠"}</strong> ${tip.tip}
              ${tip.explanation ? `<br><small>${tip.explanation}</small>` : ""}
            </div>
          `
            )
            .join("")}
          
          <h3>Structure Recommendations:</h3>
          ${feedback.structure.tips
            .map(
              (tip) => `
            <div class="tip ${tip.type === "good" ? "tip-good" : "tip-improve"}">
              <strong>${tip.type === "good" ? "✓" : "⚠"}</strong> ${tip.tip}
              ${tip.explanation ? `<br><small>${tip.explanation}</small>` : ""}
            </div>
          `
            )
            .join("")}
          
          <h3>ATS Optimization:</h3>
          ${feedback.ATS.tips
            .map(
              (tip) => `
            <div class="tip ${tip.type === "good" ? "tip-good" : "tip-improve"}">
              <strong>${tip.type === "good" ? "✓" : "⚠"}</strong> ${tip.tip}
            </div>
          `
            )
            .join("")}
        </div>

        <div class="footer">
          <p>Generated by ResumeRx - AI-Powered Resume Analysis</p>
          <p>Report generated on ${new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </body>
    </html>
    `;
  };

  const downloadReport = async () => {
    if (!feedback) return;

    setIsGeneratingReport(true);

    try {
      const htmlContent = generateReportHTML();
      const blob = new Blob([htmlContent], { type: "text/html" });
      const fileName = `Resume_Analysis_Report_${new Date().toISOString().split("T")[0]}.html`;

      // Check if the File System Access API is supported (modern browsers)
      if ("showSaveFilePicker" in window) {
        try {
          // @ts-ignore - File System Access API
          const fileHandle = await window.showSaveFilePicker({
            suggestedName: fileName,
            types: [
              {
                description: "HTML files",
                accept: {
                  "text/html": [".html"],
                },
              },
            ],
          });

          const writable = await fileHandle.createWritable();
          await writable.write(blob);
          await writable.close();

          console.log("Report saved successfully!");
        } catch (error) {
          // User cancelled the save dialog
          if (error instanceof Error && error.name !== "AbortError") {
            console.error("Error saving file:", error);
            // Fallback to traditional download
            traditionalDownload(blob, fileName);
          }
        }
      } else {
        // Fallback for browsers that don't support File System Access API
        traditionalDownload(blob, fileName);
      }
    } catch (error) {
      console.error("Error generating report:", error);
    } finally {
      setIsGeneratingReport(false);
      setShowDownloadOptions(false);
    }
  };

  const downloadReportAsPDF = async () => {
    if (!feedback) return;

    setIsGeneratingReport(true);

    try {
      const htmlContent = generateReportHTML();

      // Create a new window for printing
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        throw new Error("Popup blocked. Please allow popups for this site.");
      }

      printWindow.document.write(htmlContent);
      printWindow.document.close();

      // Wait for content to load
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          // Close the window after printing
          setTimeout(() => {
            printWindow.close();
          }, 1000);
        }, 500);
      };
    } catch (error) {
      console.error("Error generating PDF report:", error);
      alert(
        "Unable to generate PDF. Please check your browser settings and allow popups."
      );
    } finally {
      setIsGeneratingReport(false);
      setShowDownloadOptions(false);
    }
  };

  const traditionalDownload = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadResumeImage = async () => {
    if (!imageUrl) return;

    try {
      // Fetch the image blob
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const fileName = `Resume_Image_${new Date().toISOString().split("T")[0]}.png`;

      // Check if the File System Access API is supported
      if ("showSaveFilePicker" in window) {
        try {
          // @ts-ignore - File System Access API
          const fileHandle = await window.showSaveFilePicker({
            suggestedName: fileName,
            types: [
              {
                description: "Image files",
                accept: {
                  "image/png": [".png"],
                  "image/jpeg": [".jpg", ".jpeg"],
                },
              },
            ],
          });

          const writable = await fileHandle.createWritable();
          await writable.write(blob);
          await writable.close();

          console.log("Resume image saved successfully!");
        } catch (error) {
          if (error instanceof Error && error.name !== "AbortError") {
            console.error("Error saving image:", error);
            // Fallback to traditional download
            traditionalDownload(blob, fileName);
          }
        }
      } else {
        // Fallback for browsers that don't support File System Access API
        traditionalDownload(blob, fileName);
      }
    } catch (error) {
      console.error("Error downloading resume image:", error);
    }
  };

  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated)
      navigate(`/auth?next=/resume/${id}`);
  }, [isLoading]);

  useEffect(() => {
    const loadResume = async () => {
      const resume = await kv.get(`resume:${id}`);

      if (!resume) return;

      const data = JSON.parse(resume);

      const resumeBlob = await fs.read(data.resumePath);
      if (!resumeBlob) return;

      const pdfBlob = new Blob([resumeBlob], { type: "application/pdf" });
      const resumeUrl = URL.createObjectURL(pdfBlob);
      setResumeUrl(resumeUrl);

      const imageBlob = await fs.read(data.imagePath);
      if (!imageBlob) return;
      const imageUrl = URL.createObjectURL(imageBlob);
      setImageUrl(imageUrl);

      setFeedback(data.feedback);
      console.log({ resumeUrl, imageUrl, feedback: data.feedback });
    };

    loadResume();
  }, [id]);
  return (
    <main className="!pt-0">
      <nav className="resume-nav">
        <Link to="/" className="back-button">
          <img src="/icons/back.svg" alt="logo" className="w-2.5 h-2.5" />
          <span className="text-gray-800 text-sm font-semibold">
            Back to Homepage
          </span>
        </Link>

        {/* Beautiful Download Report Button with Options */}
        {feedback && (
          <div className="relative">
            <button
              onClick={() => setShowDownloadOptions(!showDownloadOptions)}
              disabled={isGeneratingReport}
              className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isGeneratingReport ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span>Download Report</span>
                  <svg
                    className={`w-4 h-4 transition-transform ${showDownloadOptions ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </>
              )}
            </button>

            {/* Download Options Dropdown */}
            {showDownloadOptions && !isGeneratingReport && (
              <div className="absolute top-full mt-2 right-0 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 min-w-48">
                <button
                  onClick={downloadReport}
                  className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                >
                  <svg
                    className="w-5 h-5 text-orange-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <div>
                    <div className="font-medium text-gray-900">
                      Download as HTML
                    </div>
                    <div className="text-sm text-gray-500">
                      Interactive web format
                    </div>
                  </div>
                </button>

                <button
                  onClick={downloadReportAsPDF}
                  className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                >
                  <svg
                    className="w-5 h-5 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <div>
                    <div className="font-medium text-gray-900">
                      Download as PDF
                    </div>
                    <div className="text-sm text-gray-500">
                      Print-ready format
                    </div>
                  </div>
                </button>
              </div>
            )}
          </div>
        )}
      </nav>
      <div className="flex flex-row w-full max-lg:flex-col-reverse">
        <section className="feedback-section bg-[url('/images/bg-small.svg') bg-cover h-[100vh] sticky top-0 items-center justify-center">
          {imageUrl && resumeUrl && (
            <div className="animate-in fade-in duration-1000 h-[90%] max-wxl:h-fit w-full max-w-md relative">
              {/* Main Resume Image Container */}
              <div className="gradient-border h-full w-full relative group">
                <img
                  src={imageUrl}
                  className="w-full h-full object-contain rounded-2xl cursor-pointer"
                  title="Click to zoom or download"
                  onClick={() => setIsImageZoomed(true)}
                />

                {/* Zoom Button */}
                <button
                  onClick={() => setIsImageZoomed(true)}
                  className="absolute top-3 right-3 bg-black/70 hover:bg-black/90 text-white p-2 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"
                  title="Zoom image"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                    />
                  </svg>
                </button>

                {/* Download Button */}
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute top-3 right-14 bg-blue-600/80 hover:bg-blue-700/90 text-white p-2 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"
                  title="Download PDF"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </a>

                {/* Save Image Button */}
                <button
                  onClick={downloadResumeImage}
                  className="absolute top-3 right-[6.5rem] bg-green-600/80 hover:bg-green-700/90 text-white p-2 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"
                  title="Save Image As..."
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </section>
        <section className="feedback-section">
          <h2 className="text-4xl !text-black font-bold">Resume Review</h2>
          {feedback ? (
            <div className="flex flex-col gap-8 animate-in fade-in duration-1000">
              <Summary feedback={feedback} />
              <ATS
                score={feedback.ATS.score || 0}
                suggestions={feedback.ATS.tips || []}
              />
              <Details feedback={feedback} />
            </div>
          ) : (
            <img src="/images/resume-scan-2.gif" className="w-full" />
          )}
        </section>
      </div>

      {/* Zoom Modal */}
      {isImageZoomed && imageUrl && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={() => setIsImageZoomed(false)}
        >
          <div className="relative max-w-6xl max-h-full w-full h-full flex items-center justify-center">
            {/* Close Button */}
            <button
              onClick={() => setIsImageZoomed(false)}
              className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all duration-200 z-10"
              title="Close zoom"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Download Button in Modal */}
            <a
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute top-4 right-20 bg-blue-600/80 hover:bg-blue-700/90 text-white p-3 rounded-full transition-all duration-200 z-10"
              title="Download PDF"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </a>

            {/* Zoomed Image */}
            <img
              src={imageUrl}
              alt="resume zoomed"
              className="max-w-full max-h-full object-contain bg-white rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </main>
  );
};

export default resume;
