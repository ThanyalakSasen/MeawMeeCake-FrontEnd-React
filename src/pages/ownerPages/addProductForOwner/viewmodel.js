import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../../../service/api";

export const useViewModel = () => {
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

  const [isLoading, setIsLoading] = useState(false);

  const [hasHeatingMethod, setHasHeatingMethod] = useState(null);

  const handleHasHeatingMethodChange = (value) => {
    setHasHeatingMethod(value);
    if (value) {
      setPreparationHeating("");
    } else {
      setPreparationHeating("ไม่มีวิธีการเตรียมอุ่น");
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoryLoading(true);
        const response = await api.get("/product-category/allCategory");
        const categories = response?.data?.data || response?.data || [];

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
      } catch (error) {
        console.error("ดึงข้อมูล Category ไม่สำเร็จ:", error);
      } finally {
        setCategoryLoading(false);
      }
    };

    fetchCategories();
  }, []);

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
      title: "ยืนยันการเพิ่มสินค้า",
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
      // Keep legacy key for compatibility with older endpoints.
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

      const token = localStorage.getItem("token");

      const response = await api.post(
        "/product/createProduct",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (response.data.success || response.status === 201) {
        const result = await Swal.fire({
          icon: "success",
          title: "เพิ่มสินค้าสำเร็จ!",
          text: "สินค้าได้ถูกเพิ่มเข้าระบบแล้ว คุณต้องการเพิ่มสูตรต่อหรือไม่?",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "ยืนยัน",
          cancelButtonText: "ยกเลิก",
          reverseButtons: true,
        });

        if (result.isConfirmed) {
          const newProductId = response.data.data?._id || response.data._id;
          if (!newProductId) {
            await Swal.fire({
              icon: "error",
              title: "เกิดข้อผิดพลาด",
              text: "ไม่พบรหัสสินค้าใหม่สำหรับไปหน้าเพิ่มสูตร",
              confirmButtonText: "ตกลง",
              confirmButtonColor: "#d33",
            });
            return;
          }
          navigate(`/add-recipes/${newProductId}`);
        } else {
          navigate("/product-manage");
        }

        setProductNameTh("");
        setProductNameEng("");
        setSelectedProductType("");
        setProductPrice("");
        setProductDescription("");
        setPreparationHeating("");
        setHasHeatingMethod(null);
        setRecipeId("");
        setImage(null);
      }
    } catch (error) {
      console.error("Add Product Error:", error);

      await Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: error.response?.data?.message || "ไม่สามารถเพิ่มสินค้าได้",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#d33",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    productNameTh,
    setProductNameTh,
    productNameEng,
    setProductNameEng,
    productTypeOptions,
    selectedProductType,
    setSelectedProductType,
    categoryLoading,
    productPrice,
    setProductPrice,
    productDescription,
    setProductDescription,
    preparationHeating,
    setPreparationHeating,
    recipeId,
    image,
    setImage,
    isLoading,
    hasHeatingMethod,
    handleHasHeatingMethodChange,
    handleSubmit,
  };
};
