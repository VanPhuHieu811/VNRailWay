USE VNRAILWAY;
GO

-- Thêm dữ liệu mẫu (3 dòng VIP)
INSERT INTO UU_DAI_GIA (MaUuDai, LoaiUuDai, MoTa, DoiTuong, PhanTram) VALUES 
('UD001', N'VIP', N'Giảm giá mùa hè', N'Tất cả', 10),
('UD002', N'VIP', N'Tri ân khách hàng', N'Thành viên vàng', 15),
('UD003', N'VIP', N'Khuyến mãi lễ', N'Sinh viên', 20),
('UD004', N'Thường', N'Giảm giá vé ghế ngồi', N'Tất cả', 5);
GO