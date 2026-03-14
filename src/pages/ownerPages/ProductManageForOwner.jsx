import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { InputField } from "../../components/inputField";
import { FiTrash2, FiEye, FiEdit } from "react-icons/fi";
import Swal from "sweetalert2";
import { Row, Col, Button, Card, Spinner, Alert } from "react-bootstrap";
import api from "../../service/api";

export default function ProductManageForOwner() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const extractProducts = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (!payload || typeof payload !== "object") return [];

    if (Array.isArray(payload.data)) return payload.data;
    if (Array.isArray(payload.products)) return payload.products;
    if (Array.isArray(payload.result)) return payload.result;

    if (payload.data && typeof payload.data === "object") {
      if (Array.isArray(payload.data.products)) return payload.data.products;
      if (Array.isArray(payload.data.result)) return payload.data.result;
    }

    return [];
  };

  const getProductId = (product) =>
    product?._id || product?.id || product?.product_id || null;

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/product/allProduct");
      const data = extractProducts(response?.data);
      setProducts(data);
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "ไม่สามารถดึงข้อมูลสินค้าได้";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSoftDelete = async (productId) => {
    const result = await Swal.fire({
      title: "ยืนยันการลบสินค้า",
      text: "คุณต้องการลบสินค้าแบบชั่วคราวใช่หรือไม่?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      const response = await api.post(
        `/product/softDeleteProduct/${productId}`,
      );

      if (response.status === 200) {
        await Swal.fire({
          icon: "success",
          title: "ลบสำเร็จ",
          text: "ลบสินค้าเรียบร้อยแล้ว",
          timer: 1500,
          showConfirmButton: false,
        });

        await fetchProducts();
      }
    } catch (err) {
      await Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: err?.response?.data?.message || "ไม่สามารถลบสินค้าได้",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#d33",
      });
    }
  };

  const handleEditProduct = async (product) => {
    const productId = getProductId(product);

    if (!productId) {
      await Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่พบรหัสสินค้า จึงไม่สามารถไปหน้าแก้ไขได้",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#d33",
      });
      return;
    }

    navigate(`/edit-product/${productId}`);
  };

  const filteredProducts = products.filter((product) => {
    if (!searchTerm) return true;
    const name = product?.product_name?.toLowerCase() || "";
    const type = product?.product_type?.toLowerCase() || "";
    return (
      name.includes(searchTerm.toLowerCase()) ||
      type.includes(searchTerm.toLowerCase())
    );
  });

  return (
    <Layout titleMain="จัดการสินค้า">
      <div
        style={{
          backgroundColor: "#fff",
          padding: "2%",
          borderRadius: "10px",
          margin: "0% 4%",
        }}
      >
        <Row className="align-items-center p-0 w-80">
          <Col md={6}>
            <form
              style={{ display: "flex", gap: "10px" }}
              onSubmit={(e) => e.preventDefault()}
            >
              <InputField
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ค้นหาชื่อ, อีเมล, รหัสพนักงาน"
              />
            </form>
          </Col>
          <Col md={6} className="text-end d-flex justify-content-end">
            <Button
              variant="primary"
              onClick={() => navigate("/add-product")}
              style={{ marginRight: "1%" }}
            >
              เพิ่มสินค้า
            </Button>

            <Button
              variant="secondary"
              onClick={() => navigate("/deleted-products")}
            >
              รายชื่อสินค้าที่ถูกลบ
            </Button>
          </Col>
        </Row>
      </div>
      <div
        style={{
          borderRadius: "10px",
          margin: "2% 4%",
        }}
      >
        <Row>
          {loading && (
            <Col className="py-4 text-center">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </Col>
          )}

          {!loading && error && (
            <Col>
              <Alert variant="danger">{error}</Alert>
            </Col>
          )}

          {!loading && !error && filteredProducts.length === 0 && (
            <Col>
              <Alert variant="info">ไม่พบสินค้า</Alert>
            </Col>
          )}

          <Row>
            {!loading &&
              !error &&
              filteredProducts.length > 0 &&
              filteredProducts.map((product, index) => {
                const productId = getProductId(product);

                return (
                  <Col
                    key={productId || `product-${index}`}
                    md={4}
                    className="mb-3"
                  >
                    <Card>
                      <Card.Img
                        variant="top"
                        src={product.product_img || "holder.js/100px180"}
                      />
                      <Card.Body>
                        <Card.Title>{product.product_name_th}</Card.Title>
                        <Card.Text>
                          ประเภท: {product.product_name_eng || "-"}
                        </Card.Text>
                        <Card.Text>
                          {product.product_price || "-"} บาท
                        </Card.Text>
                        <Row>
                          <Col md={7} className="mb-1">
                            <Button
                              variant="warning"
                              className="me-2"
                              onClick={() => handleEditProduct(product)}
                            >
                              <FiEdit style={{ marginRight: 6 }} /> แก้ไข
                            </Button>
                          </Col>
                          <Col md={4} className="mb-1">
                            <Button
                              variant="danger"
                              onClick={() => handleSoftDelete(productId)}
                              disabled={!productId}
                            >
                              <FiTrash2 style={{ marginRight: 6 }} /> ลบ
                            </Button>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  </Col>
                );
              })}
          </Row>
        </Row>
      </div>
    </Layout>
  );
}
