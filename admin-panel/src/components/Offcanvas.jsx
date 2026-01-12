export default function Offcanvas({ open, onClose, title, children }) {
    return (
        <>
            {open && (
                <div
                    onClick={onClose}
                    className="fixed inset-0 bg-black bg-opacity-40 z-40"
                />
            )}

            <div
                className={`fixed top-0 right-0 h-full w-96 bg-white shadow-xl z-50 transform transition-transform duration-300
        ${open ? "translate-x-0" : "translate-x-full"}`}
            >
                <div className="p-5 border-b flex justify-between items-center">
                    <h2 className="text-xl font-semibold">{title}</h2>
                    <button onClick={onClose} className="text-gray-600 text-2xl">×</button>
                </div>

                <div className="p-5 overflow-y-auto h-[calc(100vh-70px)]">{children}</div>
            </div>
        </>
    );
}