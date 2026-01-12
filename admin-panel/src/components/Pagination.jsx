export default function Pagination({
    currentPage,
    totalPages,
    onPageChange,
}) {
    if (totalPages <= 1) return null;

    const getPages = () => {
        const pages = [];

        // Show all if small
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
            return pages;
        }

        // Always show first page
        pages.push(1);

        let start = Math.max(2, currentPage - 1);
        let end = Math.min(totalPages - 1, currentPage + 1);

        // Adjust range near the start
        if (currentPage <= 3) {
            start = 2;
            end = 4;
        }

        // Adjust range near the end
        if (currentPage >= totalPages - 2) {
            start = totalPages - 3;
            end = totalPages - 1;
        }

        if (start > 2) pages.push("...");

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        if (end < totalPages - 1) pages.push("...");

        // Always show last page
        pages.push(totalPages);

        return pages;
    };

    return (
        <div className="flex flex-wrap justify-center items-center gap-2 mt-4">
            <button
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
                className="px-3 py-2 rounded bg-gray-200 disabled:opacity-50"
            >
                Prev
            </button>

            {getPages().map((page, idx) =>
                page === "..." ? (
                    <span key={`dots-${idx}`} className="px-2 text-gray-500">
                        ...
                    </span>
                ) : (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`px-3 py-1 rounded ${
                            page === currentPage
                                ? "bg-blue-600 text-white"
                                : "bg-gray-200"
                        }`}
                    >
                        {page}
                    </button>
                )
            )}

            <button
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(currentPage + 1)}
                className="px-3 py-2 rounded bg-gray-200 disabled:opacity-50"
            >
                Next
            </button>
        </div>
    );
}
