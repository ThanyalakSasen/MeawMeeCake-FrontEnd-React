import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Container, Spinner } from "react-bootstrap";
import axios from "axios";
import { authAPI } from "../service/api";

export default function VerifyEmailPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);

  const statusParam = query.get("status");
  const emailParam = query.get("email");

  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const [countdown, setCountdown] = useState(5);

  const hasVerified = useRef(false);

  useEffect(() => {
    const verifyEmail = async () => {
      // 🔹 Info mode (หลังสมัครเสร็จ แต่ยังไม่คลิกลิงก์)
      if (!token && statusParam === "info") {
        setStatus("info");
        setMessage(
          `เราได้ส่งลิงก์ยืนยันไปที่ ${
            emailParam || "อีเมลของคุณ"
          } แล้ว กรุณาตรวจสอบและยืนยันเพื่อเข้าสู่ระบบ`
        );
        return;
      }

      // 🔹 ไม่มี token
      if (!token) {
        setStatus("info");
        setMessage(
          "กรุณาตรวจสอบอีเมลของคุณและคลิกลิงก์ยืนยัน หากไม่ได้รับอีเมล สามารถขอส่งอีเมลยืนยันใหม่ได้"
        );
        return;
      }

      // 🔹 กันยิง API ซ้ำ
      if (hasVerified.current) return;
      hasVerified.current = true;

      try {
        const res = await authAPI.verifyEmail(token);

        if (res.success) {
          setStatus("success");
          setMessage("ยืนยันอีเมลสำเร็จ! กำลังนำคุณไปหน้าเข้าสู่ระบบ...");

          const timer = setInterval(() => {
            setCountdown((prev) => {
              if (prev <= 1) {
                clearInterval(timer);
                navigate("/login", { replace: true });
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        }
      } catch (error) {
        setStatus("error");

        if (axios.isAxiosError(error)) {
          const msg = error.response?.data?.message || "";

          if (msg.includes("หมดอายุ")) {
            setMessage("ลิงก์ยืนยันหมดอายุแล้ว กรุณาขอลิงก์ใหม่");
          } else if (msg.includes("ไม่ถูกต้อง")) {
            setMessage("ลิงก์ยืนยันไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง");
          } else {
            setMessage(msg || "เกิดข้อผิดพลาดในการยืนยันอีเมล");
          }
        } else {
          setMessage("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง");
        }
      }
    };

    verifyEmail();
  }, [token, statusParam, emailParam, navigate]);

  const handleResendEmail = () => {
    navigate("/login", {
      state: { message: "กรุณาเข้าสู่ระบบและขอส่งอีเมลยืนยันใหม่" },
    });
  };

  return (
    <Container
  fluid
  style={{
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#FFFDF5", // สีครีมนวลๆ เหมือนแป้ง
    padding: "40px 20px",
  }}
>
  <div
    style={{
      backgroundColor: "white",
      padding: "50px 40px",
      borderRadius: "32px", // โค้งมนแบบละมุน
      boxShadow: "0 10px 30px rgba(245, 224, 150, 0.3)", // เงาสีทองอ่อนๆ
      maxWidth: "480px",
      width: "100%",
      textAlign: "center",
      border: "1px solid #FDF2D2"
    }}
  >
    {/* ส่วน Icon ด้านบนเพื่อความน่ารัก */}
    

    {status === "loading" && (
      <>
        <Spinner 
          animation="border" 
          style={{ width: 60, height: 60, marginBottom: 24, color: "#FFD95A" }} 
        />
        <h4 style={{ fontWeight: "bold", color: "#8D6E63", marginBottom: 12 }}>กำลังอบข้อมูล...</h4>
        <p style={{ color: "#A1887F" }}>กรุณารอสักครู่ ระบบกำลังยืนยันอีเมลให้คุณค่ะ</p>
      </>
    )}

    {status === "success" && (
      <>
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            backgroundColor: "#E8F5E9", // สีเขียวมัทฉะอ่อนๆ
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
            fontSize: 40,
            color: "#4CAF50"
          }}
        >
          ✨
        </div>
        <h3 style={{ color: "#6D8B74", fontWeight: "bold", marginBottom: 16 }}>ยืนยันอีเมลสำเร็จ</h3>
        <p style={{ color: "#8D6E63", marginBottom: 24 }}>{message}</p>
        <div
          style={{
            padding: "20px",
            backgroundColor: "#FFF9E6",
            borderRadius: "16px",
            border: "1px dashed #FFD95A",
            color: "#5D4037"
          }}
        >
          กำลังนำคุณไปหน้าเข้าสู่ระบบ{" "}
          <strong style={{ fontSize: 24, color: "#F4B400" }}>{countdown}</strong>{" "}
          วินาที
        </div>
      </>
    )}

    {status === "info" && (
      <>
        <h3 style={{ color: "#8D6E63", fontWeight: "bold", marginBottom: 16 }}>กรุณายืนยันอีเมล</h3>
        <p style={{ color: "#A1887F", marginBottom: 24 }}>{message}</p>
        <button 
          className="btn" 
          onClick={handleResendEmail}
          style={{ 
            backgroundColor: "#FFD95A", 
            color: "#5D4037", 
            fontWeight: "bold", 
            borderRadius: "50px",
            padding: "10px 30px",
            border: "none"
          }}
        >
          กลับไปหน้าเข้าสู่ระบบ
        </button>
      </>
    )}

    {status === "error" && (
      <>
        <div style={{ fontSize: "50px", marginBottom: "10px" }}>🥨</div>
        <h3 style={{ color: "#E57373", fontWeight: "bold", marginBottom: 16 }}>อุ๊ปส์! มีบางอย่างผิดพลาด</h3>
        <p style={{ color: "#A1887F", marginBottom: 24 }}>{message}</p>
        <button 
          className="btn" 
          onClick={() => navigate("/login")}
          style={{ 
            backgroundColor: "#8D6E63", 
            color: "white", 
            borderRadius: "50px",
            padding: "10px 30px",
            border: "none"
          }}
        >
          กลับไปตั้งหลักใหม่
        </button>
      </>
    )}
  </div>
</Container>
  );
}
