import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function ProductDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [productTechnicians, setProductTechnicians] = useState([]);
    const [loadingTechs, setLoadingTechs] = useState(false);

    useEffect(() => {
        setLoading(true);
        api.get(`/inventory/product-list`).then(res => {
            const found = (res.data.data || []).find(p => p._id === id);
            setProduct(found || null);
            setLoading(false);
        });
    }, [id]);

    useEffect(() => {
        if (!product) return;
        setLoadingTechs(true);
        api.get(`/material/product-technicians/${product._id}`)
            .then(res => setProductTechnicians(res.data.data || []))
            .catch(() => setProductTechnicians([]))
            .finally(() => setLoadingTechs(false));
    }, [product]);

    if (loading) return <div className="p-6">Loading...</div>;
    if (!product) return <div className="p-6">Product not found</div>;

    return (
        <div className="p-6 bg-white rounded shadow mt-8 max-w-xl mx-auto">
            <button className="mb-4 text-blue-600 underline" onClick={() => navigate(-1)}>← Back</button>
            <h3 className="text-2xl font-bold mb-4">Product Details</h3>
            <div className="space-y-2 mb-4">
                <div><b>Product Name:</b> {product.productName}</div>
                <div><b>Quantity:</b> {product.quantity}</div>
                <div><b>Price:</b> {product.price}</div>
                <div><b>Stock:</b> {product.stock ? "In Stock" : "Out of Stock"}</div>
            </div>
            <div>
                <b>Processed To Technicians:</b>
                {loadingTechs ? (
                    <div className="text-gray-500 mt-2">Loading...</div>
                ) : productTechnicians.length === 0 ? (
                    <div className="text-gray-500 mt-2">No requests yet.</div>
                ) : (
                    <div className="overflow-x-auto mt-2">
                        <table className="min-w-full border border-gray-200 rounded">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="px-3 py-2 border-b text-left">#</th>
                                    <th className="px-3 py-2 border-b text-left">Technician Name</th>
                                    <th className="px-3 py-2 border-b text-left">Quantity</th>
                                    <th className="px-3 py-2 border-b text-left">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {productTechnicians.map((item, idx) => (
                                    <tr key={item._id} className="hover:bg-gray-50">
                                        <td className="px-3 py-2 border-b">{idx + 1}</td>
                                        <td className="px-3 py-2 border-b">
                                            {item.technician?.firstName} {item.technician?.lastName}
                                        </td>
                                        <td className="px-3 py-2 border-b">{item.quantity}</td>
                                        <td className="px-3 py-2 border-b">
                                            <span className={
                                                item.status === "approved"
                                                    ? "text-green-600 font-semibold"
                                                    : item.status === "pending"
                                                        ? "text-yellow-600 font-semibold"
                                                        : "text-bgGreen font-semibold"
                                            }>
                                                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}