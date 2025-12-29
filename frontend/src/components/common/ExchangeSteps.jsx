import React from 'react';
import '../../styles/pages/ExchangeFlow.css';

const STEPS = [
  { num: 2, name: "Chi tiết vé" },
  { num: 3, name: "Tìm chuyến mới" },
  { num: 4, name: "Chọn chuyến mới" },
  { num: 5, name: "Chọn chỗ mới" },
  { num: 6, name: "Xác nhận" },
  { num: 7, name: "Hoàn tất" }
];

const ExchangeSteps = ({ currentStep }) => {
  return (
    <div className="exchange-steps-header">
      <div className="ex-step-wrapper">
        {STEPS.map((step, index) => (
          <React.Fragment key={step.num}>
            <div className={`ex-step-item ${currentStep >= step.num ? 'active' : ''}`}>
              <div className="ex-step-number">{step.num}</div>
              <span className="hidden md:block">{step.name}</span>
            </div>
            {/* Vẽ đường nối nếu không phải phần tử cuối */}
            {index < STEPS.length - 1 && <div className="ex-step-line"></div>}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default ExchangeSteps;