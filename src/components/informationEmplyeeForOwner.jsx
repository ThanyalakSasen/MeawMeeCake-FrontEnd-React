import { Container, Row, Col, Card, Image, Button } from 'react-bootstrap';
import { FiEdit } from 'react-icons/fi';
import { useNavigate } from "react-router-dom";

export default function InformationEmployeeForOwner({ employee }) {
  const navigate = useNavigate();
  
  if (!employee) {
    return (
      <Container className="p-4">
        <p className="text-center text-muted">กำลังโหลดข้อมูล...</p>
      </Container>
    );
  }

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    // ถ้า path เป็น /uploads/... ให้เพิ่ม backend URL
    if (imagePath.startsWith('/uploads/')) {
      return `http://localhost:3000${imagePath}`;
    }
    return imagePath;
  };

  return (
    <Container className="p-4">
      <Row>
        <Col md={12}>
          <Card className="shadow-sm mb-4 p-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0"><strong>ข้อมูลพนักงาน</strong></h5>
                {/* <Badge bg={employee.emp_status === 'Active' ? 'success' : 'secondary'}>
                  {employee.emp_status === 'Active' ? 'ปฏิบัติงาน' : 'ไม่ได้ปฏิบัติงาน'}
                </Badge> */}
                <div className="text-end">
                  <Button
                    size="sm"
                    variant="warning"
                    onClick={() => navigate(`/edit-info-employee/${employee._id}`)}
                  >
                    <FiEdit /> แก้ไขข้อมูล
                  </Button>
                </div>
              </div>

              {/* รูปภาพพนักงาน */}
              <div className="text-center mb-4">
                <Image
                  src={getImageUrl(employee.user_img) || 'https://via.placeholder.com/200'}
                  roundedCircle
                  width={200}
                  height={200}
                  className="border shadow-sm"
                  style={{ objectFit: 'cover' }}
                  alt={employee.user_fullname}
                />
              </div>
              
              
              <Row className="mt-4">
                <Col md={6}>
                  <div className="mb-3">
                    <strong>รหัสพนักงาน:</strong>
                    <p className="text-muted">{employee.emp_id || '-'}</p>
                  </div>
                  <div className="mb-3">
                    <strong>ชื่อ-นามสกุล:</strong>
                    <p className="text-muted">{employee.user_fullname || '-'}</p>
                  </div>
                  <div className="mb-3">
                    <strong>อีเมล:</strong>
                    <p className="text-muted">{employee.email || '-'}</p>
                  </div>
                  <div className="mb-3">
                    <strong>เบอร์โทรศัพท์:</strong>
                    <p className="text-muted">{employee.user_phone || '-'}</p>
                  </div>
                  <div className="mb-3">
                    <strong>วันเกิด:</strong>
                    <p className="text-muted">{formatDate(employee.user_birthdate)}</p>
                  </div>
                </Col>
                
                <Col md={6}>
                  <div className="mb-3">
                    <strong>ตำแหน่ง:</strong>
                    <p className="text-muted">{employee.emp_position?.position_name || '-'}</p>
                  </div>
                  <div className="mb-3">
                    <strong>ประเภทการจ้าง:</strong>
                    <p className="text-muted">
                      {employee.employment_type === 'Full-time' ? 'เต็มเวลา' : 
                       employee.employment_type === 'Part-time' ? 'พาร์ทไทม์' : '-'}
                    </p>
                  </div>
                  {employee.employment_type === 'Full-time' && (
                    <div className="mb-3">
                      <strong>เงินเดือน:</strong>
                      <p className="text-muted">{employee.emp_salary?.toLocaleString() || '-'} บาท</p>
                    </div>
                  )}
                  {employee.employment_type === 'Part-time' && (
                    <div className="mb-3">
                      <strong>ชั่วโมงทำงาน:</strong>
                      <p className="text-muted">{employee.partTimeHours || '-'} ชั่วโมง/วัน</p>
                    </div>
                  )}
                  <div className="mb-3">
                    <strong>วันที่เริ่มงาน:</strong>
                    <p className="text-muted">{formatDate(employee.start_working_date)}</p>
                  </div>
                  {employee.last_working_date && (
                    <div className="mb-3">
                      <strong>วันที่สิ้นสุดการทำงาน:</strong>
                      <p className="text-muted">{formatDate(employee.last_working_date)}</p>
                    </div>
                  )}
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}