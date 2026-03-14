import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { Row, Col, Spinner, Form, Image, Alert } from "react-bootstrap";
import Layout from "../../../components/Layout";
import { InputField } from "../../../components/inputField";
import { SelectInput } from "../../../components/selectInput";
import { TextArea } from "../../../components/TextArea";
import SquareImageUpload from "../../../components/SquareImageUpload";
import api from "../../../service/api";

export default function ProductUpdate() {
	const { productId } = useParams();
	const navigate = useNavigate();

	const [productNameTh, setProductNameTh] = useState("");
	const [productNameEng, setProductNameEng] = useState("");
	const [productTypeOptions, setProductTypeOptions] = useState([
		{ value: "", label: "กรุณาเลือกประเภทสินค้า" },
	]);
	const [selectedProductType, setSelectedProductType] = useState("");
	const [categoryLoading, setCategoryLoading] = useState(false);
	const [productPrice, setProductPrice] = useState("");
	const [productDescription, setProductDescription] = useState("");
	const [preparationHeating, setPreparationHeating] = useState("");
	const [recipeId, setRecipeId] = useState("");
	const [image, setImage] = useState(null);
	const [existingImageUrl, setExistingImageUrl] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [isFetching, setIsFetching] = useState(true);
	const [hasHeatingMethod, setHasHeatingMethod] = useState(null);
	const [fetchError, setFetchError] = useState("");

	const handleHasHeatingMethodChange = (value) => {
		setHasHeatingMethod(value);
		if (value) {
			setPreparationHeating("");
		} else {
			setPreparationHeating("ไม่มีวิธีการเตรียมอุ่น");
		}
	};

	useEffect(() => {
		const fetchInitialData = async () => {
			try {
				setIsFetching(true);
				setCategoryLoading(true);
				setFetchError("");

				const [categoriesResult, productResult] = await Promise.allSettled([
					api.get("/product-category/allCategory"),
					api.get(`/product/getByIdProduct/${productId}`),
				]);

				const categoriesResponse =
					categoriesResult.status === "fulfilled"
						? categoriesResult.value
						: null;
				const productResponse =
					productResult.status === "fulfilled" ? productResult.value : null;

				if (!productResponse) {
					throw new Error("ไม่สามารถโหลดข้อมูลสินค้าได้");
				}

				const categories =
					categoriesResponse?.data?.data || categoriesResponse?.data || [];

				const options = [
					{ value: "", label: "กรุณาเลือกประเภทสินค้า" },
					...categories.map((cat) => ({
						value: cat._id,
						label:
							cat.productcategoriesName ||
							cat.category_name ||
							cat.productCategory_name ||
							"-",
					})),
				];

				setProductTypeOptions(options);

				const product = productResponse?.data?.data || productResponse?.data || {};

				setProductNameTh(product.product_name_th || "");
				setProductNameEng(product.product_name_eng || "");
				setProductPrice(product.product_price ?? "");
				setProductDescription(product.product_description || "");
				setPreparationHeating(product.preparation_heating || "");
				setRecipeId(product.recipe_id?._id || product.recipe_id || "");

				const categoryId =
					product.productcategories?._id ||
					product.productcategories ||
					product.product_type ||
					"";
				setSelectedProductType(categoryId);

				const currentImage = product.product_img || "";
				if (currentImage) {
					const normalizedImage = currentImage.startsWith("http")
						? currentImage
						: `${api.defaults.baseURL}${currentImage}`;
					setExistingImageUrl(normalizedImage);
				}

				const hasHeating =
					!!product.preparation_heating &&
					product.preparation_heating !== "ไม่มีวิธีการเตรียมอุ่น";
				setHasHeatingMethod(hasHeating);
			} catch (error) {
				console.error("โหลดข้อมูลสินค้าไม่สำเร็จ:", error);
				setFetchError(
					error?.response?.data?.message ||
						error?.message ||
						"ไม่สามารถโหลดข้อมูลสินค้าได้"
				);
			} finally {
				setCategoryLoading(false);
				setIsFetching(false);
			}
		};

		fetchInitialData();
	}, [navigate, productId]);

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (
			!productNameTh ||
			!productNameEng ||
			!selectedProductType ||
			!productPrice
		) {
			await Swal.fire({
				icon: "error",
				title: "เกิดข้อผิดพลาด",
				text: "กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน",
				showConfirmButton: false,
				timer: 3000,
			});
			return;
		}

		const selectedTypeLabel =
			productTypeOptions.find((opt) => opt.value === selectedProductType)
				?.label || "-";

		const result = await Swal.fire({
			title: "ยืนยันการแก้ไขสินค้า",
			html: `
				<div style="text-align: left;">
					<p><strong>ชื่อสินค้า:</strong> ${productNameTh} / ${productNameEng}</p>
					<p><strong>ประเภท:</strong> ${selectedTypeLabel}</p>
					<p><strong>ราคา:</strong> ${productPrice} บาท</p>
				</div>
			`,
			icon: "question",
			showCancelButton: true,
			confirmButtonColor: "#3085d6",
			cancelButtonColor: "#d33",
			confirmButtonText: "ยืนยัน",
			cancelButtonText: "ยกเลิก",
			reverseButtons: true,
		});

		if (!result.isConfirmed) return;

		try {
			setIsLoading(true);

			const formData = new FormData();
			formData.append("product_name_th", productNameTh);
			formData.append("product_name_eng", productNameEng);
			formData.append("productcategories", selectedProductType);
			formData.append("product_type", selectedProductType);
			formData.append("product_price", productPrice);
			formData.append("product_description", productDescription);
			formData.append("preparation_heating", preparationHeating);

			if (recipeId && recipeId !== "") {
				formData.append("recipe_id", recipeId);
			}

			if (image) {
				formData.append("product_img", image);
			}

			const response = await api.put(
				`/product/updateProduct/${productId}`,
				formData,
				{
					headers: {
						"Content-Type": "multipart/form-data",
					},
				},
			);

			if (response.status === 200 || response.data?.success) {
				await Swal.fire({
					icon: "success",
					title: "อัปเดตสินค้าสำเร็จ!",
					text: "บันทึกการแก้ไขสินค้าเรียบร้อยแล้ว",
					confirmButtonText: "ตกลง",
					confirmButtonColor: "#3085d6",
				});

				navigate(`/product-detail/${productId}`);
			}
		} catch (error) {
			console.error("Update Product Error:", error);
			await Swal.fire({
				icon: "error",
				title: "เกิดข้อผิดพลาด",
				text: error?.response?.data?.message || "ไม่สามารถอัปเดตสินค้าได้",
				confirmButtonText: "ตกลง",
				confirmButtonColor: "#d33",
			});
		} finally {
			setIsLoading(false);
		}
	};

	if (isFetching) {
		return (
			<Layout titleMain="แก้ไขสินค้า">
				<div className="text-center py-5">
					<Spinner animation="border" role="status" />
				</div>
			</Layout>
		);
	}

	if (fetchError) {
		return (
			<Layout titleMain="แก้ไขสินค้า">
				<Row className="m-3">
					<Col md={10} className="w-100">
						<Alert variant="danger">{fetchError}</Alert>
						<button
							type="button"
							className="btn btn-secondary"
							onClick={() => navigate("/product-manage")}
						>
							กลับไปหน้าจัดการสินค้า
						</button>
					</Col>
				</Row>
			</Layout>
		);
	}

	return (
		<Layout titleMain="แก้ไขสินค้า">
			<Row className="m-3">
				<Col md={10} className="w-100">
					<div className="p-4 bg-white rounded">
						<form onSubmit={handleSubmit}>
							<Row className="p-5 g-5">
								<Col md={6}>
									<InputField
										label="ชื่อสินค้า (ภาษาไทย) *"
										value={productNameTh}
										onChange={(e) => setProductNameTh(e.target.value)}
									/>
									<InputField
										label="ชื่อสินค้า (ภาษาอังกฤษ) *"
										value={productNameEng}
										onChange={(e) => setProductNameEng(e.target.value)}
									/>
									<InputField
										label="ราคาสินค้า (บาท) *"
										type="number"
										value={productPrice}
										onChange={(e) => setProductPrice(e.target.value)}
									/>
									<SelectInput
										label="ประเภทสินค้า *"
										options={productTypeOptions}
										value={selectedProductType}
										onChange={(e) => setSelectedProductType(e.target.value)}
										disabled={categoryLoading}
									/>
									<TextArea
										label="คำอธิบายสินค้า"
										value={productDescription}
										onChange={(e) => setProductDescription(e.target.value)}
									/>
									<div style={{ marginBottom: "16px", marginTop: "24px" }}>
										<label
											style={{
												display: "block",
												marginBottom: "12px",
												fontWeight: "500",
											}}
										>
											มีวิธีการเตรียมอุ่น/เก็บรักษาหรือไม่
										</label>
										<div style={{ display: "flex", gap: "16px" }}>
											<Form.Check
												type="radio"
												id="has-heating-method-yes"
												name="hasHeatingMethod"
												label="มี"
												checked={hasHeatingMethod === true}
												onChange={() => handleHasHeatingMethodChange(true)}
												style={{ cursor: "pointer" }}
											/>
											<Form.Check
												type="radio"
												id="has-heating-method-no"
												name="hasHeatingMethod"
												label="ไม่มี"
												checked={hasHeatingMethod === false}
												onChange={() => handleHasHeatingMethodChange(false)}
												style={{ cursor: "pointer" }}
											/>
										</div>
									</div>
									{hasHeatingMethod === true && (
										<Col md={12}>
											<TextArea
												label="วิธีการเตรียมอุ่น"
												value={preparationHeating}
												onChange={(e) => setPreparationHeating(e.target.value)}
											/>
										</Col>
									)}
								</Col>

								<Col md={6}>
									{existingImageUrl && !image && (
										<div className="mb-3 text-center">
											<div className="mb-2 fw-medium">รูปปัจจุบัน</div>
											<Image
												src={existingImageUrl}
												alt="Current product"
												fluid
												rounded
												style={{ maxHeight: "240px", objectFit: "cover" }}
											/>
										</div>
									)}
									<SquareImageUpload
										label="อัปโหลดรูปใหม่"
										image={image}
										setImage={setImage}
										fluid
									/>
								</Col>
							</Row>

							<div className="text-center mt-4">
								<button
									type="submit"
									className="btn btn-success"
									disabled={isLoading}
								>
									{isLoading ? (
										<>
											<Spinner
												as="span"
												animation="border"
												size="sm"
												role="status"
												aria-hidden="true"
												className="me-2"
											/>
											กำลังบันทึก...
										</>
									) : (
										"บันทึกข้อมูล"
									)}
								</button>
							</div>
						</form>
					</div>
				</Col>
			</Row>
		</Layout>
	);
}
