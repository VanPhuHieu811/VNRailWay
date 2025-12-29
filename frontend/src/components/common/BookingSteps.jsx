import React from 'react';
import '../../styles/pages/BookingFlow.css';

const STEPS = [
  { num: 1, name: "Tìm kiếm" },
  { num: 2, name: "Chọn chuyến" },
  { num: 3, name: "Chọn chỗ" },
  { num: 4, name: "Thông tin khách" }, // --- MỚI THÊM ---
  { num: 5, name: "Thanh toán" },
  { num: 6, name: "Hoàn tất" } // Đẩy lên thành bước 6
];

const BookingSteps = ({ currentStep }) => {
  return (
    <div className="step-header">
      <div className="step-wrapper">
        {STEPS.map((step, index) => (
          <React.Fragment key={step.num}>
            <div className={`step-item ${currentStep >= step.num ? 'active' : ''}`}>
              <div className="step-number">{step.num}</div>
              <span className="hidden md:block">{step.name}</span>
            </div>
            {index < STEPS.length - 1 && <div className="step-line"></div>}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default BookingSteps;