function Warning() {
    return (
        <div className="bg-[#1F1C17] border border-yellow-500/30 rounded-lg p-6 backdrop-blur-sm">
            <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 bg-yellow-500/10 rounded-full p-2">
                    <svg className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-yellow-500">Download Not Available</h3>
                    <p className="mt-1 text-gray-300/80">This content hasn't been released for download yet.</p>
                    <div className="mt-4 flex flex-wrap gap-3">
                        <button
                            onClick={() => window.history.back()}
                            className="inline-flex items-center px-4 py-2 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 text-sm font-medium rounded-md transition-colors"
                        >
                            Go Back
                        </button>
                        <button
                            onClick={() => window.location.reload()}
                            className="inline-flex items-center px-4 py-2 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 text-sm font-medium rounded-md transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Warning;