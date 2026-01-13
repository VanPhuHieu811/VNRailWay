// test-lost-update.js

// Cấu hình URL API (Sửa lại port 5000 hoặc port bạn đang chạy)
const API_URL = 'http://localhost:5000/api/booking/dat-ve'; 

// Dữ liệu giả lập cho Khách A
const payloadA = {
    maKhachHang: 'KH_A',
    maChuyenTau: 'CT01',
    maViTri: 'VT001',
    maDatVe: 'DV01',
    maBangGia: 'BG01'
};

// Dữ liệu giả lập cho Khách B (Trùng vị trí VT001 với A)
const payloadB = {
    maKhachHang: 'KH_B',
    maChuyenTau: 'CT01',
    maViTri: 'VT001', 
    maDatVe: 'DV01',
    maBangGia: 'BG01'
};

async function goiApi(tenKhach, data) {
    try {
        console.log(`🚀 ${tenKhach} đang gửi yêu cầu đặt vé...`);
        
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        
        if (response.ok) {
            console.log(`✅ ${tenKhach} Thành công:`, result.message);
        } else {
            console.log(`❌ ${tenKhach} Thất bại:`, result.message);
        }

    } catch (error) {
        console.log(`❌ Lỗi kết nối của ${tenKhach}:`, error.message);
    }
}

console.log('--- BẮT ĐẦU TEST LOST UPDATE (TRANH CHẤP) ---');

// Gọi 2 hàm này KHÔNG dùng await để chúng chạy song song cùng lúc
goiApi('KH_A', payloadA);
goiApi('KH_B', payloadB);