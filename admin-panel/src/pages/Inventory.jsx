import { useEffect, useState } from "react";
import api from "../services/api";
import Table from "../components/Table";
import Offcanvas from "../components/Offcanvas";
import Pagination from "../components/Pagination";
import toast from "react-hot-toast";
import { formatDateTime } from "../utils/dateUtils";
import { useNavigate } from "react-router-dom";

export default function Inventory() {
    const [inventory, setInventory] = useState([]);
    const [openCanvas, setOpenCanvas] = useState(false);
    const [editData, setEditData] = useState(null);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState("");
    const navigate = useNavigate();
    const [form, setForm] = useState({
        productName: "",
        quantity: "",
        stock: true,
        price: "",
        lowStock: ""
    });
    const ITEMS_PER_PAGE = 10;
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        setCurrentPage(1);
    }, [inventory]);

    const token = localStorage.getItem("token");

    const loadInventory = async () => {
        try {
            setLoading(true);
            const res = await api.get("/inventory/product-list");
            setInventory(res.data.data);
            setLoading(false);
        } catch (err) {
            toast.error(err.response?.data?.message);
        }
    };

    useEffect(() => {
        loadInventory();
    }, []);

    const openCreate = () => {
        setForm({
            productName: "",
            quantity: "",
            stock: true,
            price: "",
            lowStock: ""
        });
        setEditData(null);
        setOpenCanvas(true);
    };

    const openEdit = (item) => {
        setEditData(item);
        setForm({
            productName: item.productName,
            quantity: item.quantity,
            stock: !!item.stock,
            price: item.price,
            lowStock: item.lowStock
        });
        setOpenCanvas(true);
    };

    const saveInventory = async (e) => {
        e.preventDefault();
        const payload = { ...form };
        if (editData) payload.id = editData._id;
        try {
            const res = await api.post(
                editData ? "/inventory/update-products" : "/inventory/add-products",
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success(res.data.message);
            setOpenCanvas(false);
            loadInventory();
        } catch (err) {
            toast.error(err.response?.data?.message);
        }
    };

    const deleteInventory = async (id) => {
        try {
            const res = await api.post(
                "/inventory/delete-products",
                { id },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success(res.data.message);
            loadInventory();
        } catch (err) {
            toast.error(err.response?.data?.message);
        }
    };

    const toggleStock = async (item) => {
        try {
            const res = await api.post(
                "/inventory/stock-update",
                { id: item._id, stock: !item.stock },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success(res.data.message);
            loadInventory();
        } catch (err) {
            toast.error(err.response?.data?.message);
        }
    };

    useEffect(() => {
        const lowStockProducts = inventory.filter(item => {
            const qty = Number(item.quantity);
            const threshold = Number(item.lowStock);
            return !isNaN(qty) && !isNaN(threshold) && qty <= threshold;
        });
        if (lowStockProducts.length > 0) {
            toast.error(
                `Alert: ${lowStockProducts.map(p => p.productName).join(", ")} ${lowStockProducts.length > 1 ? "have" : "has"
                } low stock`
            );
        }
    }, [inventory]);

    const filteredInventory = inventory.filter(s =>
        (statusFilter === "" || (statusFilter === "enabled" && s.stock) || (statusFilter === "disabled" && !s.stock)) &&
        (
            String(s.productName || "").toLowerCase().includes(search.toLowerCase()) ||
            String(s.quantity || "").toLowerCase().includes(search.toLowerCase()) ||
            String(s.price || "").toLowerCase().includes(search.toLowerCase()) ||
            String(s.lowStock || "").toLowerCase().includes(search.toLowerCase())
        )
    );

    const totalPages = Math.ceil(filteredInventory.length / ITEMS_PER_PAGE);

    const paginatedInventory = filteredInventory.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                <h2 className="text-[20px] sm:text-[25px] font-bold text-textGreen">
                    Inventory List
                </h2>
                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto md:justify-end">
                    <input
                        type="text"
                        placeholder="Search product"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="border p-2 rounded w-full sm:w-48"
                    />
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        className="border p-2 rounded"
                    >
                        <option value="">All Status</option>
                        <option value="enabled">Enabled</option>
                        <option value="disabled">Disabled</option>
                    </select>
                    <button
                        onClick={openCreate}
                        className="bg-bgGreen text-white px-4 py-2 rounded w-full sm:w-auto"
                    >
                        Add Product
                    </button>
                </div>
            </div>
            {loading ? (
                <div className="flex justify-center items-center py-10">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-textGreen"></div>
                </div>
            ) : (
                <>
                    <div className="mb-2 text-left text-sm text-gray-600">
                        Total no of Products: {filteredInventory.length}
                    </div>
                    <Table
                        columns={[
                            {
                                title: "S.No",
                                key: "sno",
                                render: (_, __, idx) =>
                                    (currentPage - 1) * ITEMS_PER_PAGE + idx + 1,
                            },
                            { title: "Product Name", key: "productName" },
                            { title: "Quantity", key: "quantity" },
                            { title: "Price", key: "price" },
                            { title: "Low Stock", key: "lowStock" },
                            {
                                title: "Stock",
                                key: "stock",
                                render: (stock, row) => (
                                    <button
                                        onClick={() => toggleStock(row)}
                                        className={`px-3 py-1 rounded ${stock ? "bg-red-500 text-white" : "bg-green-500 text-white"}`}
                                    >
                                        {stock ? "Disable" : "Enable"}
                                    </button>
                                ),
                            },
                            {
                                title: "Date & Time",
                                key: "updatedAt",
                                render: (_, row) => formatDateTime(row.updatedAt)
                            },
                        ]}
                        data={paginatedInventory}
                        actions={(row) => (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => navigate(`/inventory/${row._id}`)}
                                    className="bg-blue-500 text-white px-3 py-1 rounded"
                                >
                                    View
                                </button>
                                <button
                                    onClick={() => openEdit(row)}
                                    className="bg-yellow-500 text-white px-3 py-1 rounded"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => deleteInventory(row._id)}
                                    className="bg-red-600 text-white px-3 py-1 rounded"
                                >
                                    Delete
                                </button>
                            </div>
                        )}
                    />
                    {totalPages > 1 && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    )}
                </>
            )}
            <Offcanvas
                open={openCanvas}
                onClose={() => setOpenCanvas(false)}
                title={editData ? "Edit Product" : "Add Product"}
            >
                <form onSubmit={saveInventory} className="space-y-4">
                    <div>
                        <label className="block mb-1 font-medium">Product Name</label>
                        <input
                            type="text"
                            value={form.productName}
                            onChange={(e) => setForm({ ...form, productName: e.target.value })}
                            className="w-full border p-2 rounded"
                            required
                        />
                    </div>
                    <div>
                        <label className="block mb-1 font-medium">Quantity</label>
                        <input
                            type="text"
                            value={form.quantity}
                            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                            className="w-full border p-2 rounded"
                            required
                        />
                    </div>
                    <div>
                        <label className="block mb-1 font-medium">Price</label>
                        <input
                            type="number"
                            value={form.price}
                            onChange={(e) => setForm({ ...form, price: e.target.value })}
                            className="w-full border p-2 rounded"
                            required
                        />
                    </div>
                    <div>
                        <label className="block mb-1 font-medium">Low Stock</label>
                        <input
                            type="number"
                            value={form.lowStock}
                            onChange={(e) => setForm({ ...form, lowStock: e.target.value })}
                            className="w-full border p-2 rounded"
                            required
                        />
                    </div>
                    <div>
                        <label className="block mb-1 font-medium">Stock</label>
                        <input
                            type="checkbox"
                            checked={form.stock}
                            onChange={(e) => setForm({ ...form, stock: e.target.checked })}
                            className="mr-2"
                        />
                        <span>{form.stock ? "In Stock" : "Out of Stock"}</span>
                    </div>
                    <button className="w-full bg-bgGreen text-white py-2 rounded">
                        {editData ? "Update Product" : "Create Product"}
                    </button>
                </form>
            </Offcanvas>
        </div>
    );
}