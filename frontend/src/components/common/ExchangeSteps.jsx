import React from 'react';
import '../../styles/pages/ExchangeFlow.css';

// Danh sách các bước cho NHÂN VIÊN (Sales) - Có bước Tra cứu
const STEPS_SALES = [
  { num: 1, name: "Tra cứu" },
  { num: 2, name: "Chi tiết vé" },
  { num: 3, name: "Tìm chuyến mới" },
  { num: 4, name: "Chọn chỗ" },
  { num: 5, name: "Xác nhận" },
  { num: 6, name: "Hoàn tất" }
];

// Danh sách các bước cho KHÁCH HÀNG (Customer) - Bắt đầu từ Chi tiết vé
const STEPS_CUSTOMER = [
  { num: 1, name: "Chi tiết vé" },
  { num: 2, name: "Tìm chuyến mới" },
  { num: 3, name: "Chọn chuyến" },
  { num: 4, name: "Chọn chỗ" },
  { num: 5, name: "Xác nhận" },
  { num: 6, name: "Hoàn tất" }
];

const ExchangeSteps = ({ currentStep, isEmployee = false }) => {
  // Chọn danh sách step dựa trên Role
  const stepsToRender = isEmployee ? STEPS_SALES : STEPS_CUSTOMER;

  return (
    <div className="exchange-steps-header">
      <div className="ex-step-wrapper">
        {stepsToRender.map((step, index) => {
          // Kiểm tra trạng thái Active
          const isActive = currentStep >= step.num;
          
          return (
            <React.Fragment key={step.num}>
              <div className={`ex-step-item ${isActive ? 'active' : ''}`}>
                <div className="ex-step-number">{step.num}</div>
                <span className="ex-step-name hidden md:block">{step.name}</span>
              </div>
              
              {/* Vẽ đường nối nếu không phải phần tử cuối */}
              {index < stepsToRender.length - 1 && (
                <div className={`ex-step-line ${currentStep > step.num ? 'active' : ''}`}></div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default ExchangeSteps;