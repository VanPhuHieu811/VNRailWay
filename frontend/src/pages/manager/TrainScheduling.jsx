import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
    Train, Calendar, Clock, MapPin, Users,
    Plus, Check, X, ArrowRight, User,
    Filter, Briefcase, Save, AlertCircle, Circle, Loader, Search
} from 'lucide-react';

// --- IMPORT API SERVICES ---
import {
    getTrainScheduleApi,
    getTripTimelineApi,
    updateTripTimeApi,
    getUnassignedTripsApi,
    getTripAssignmentsApi,
    assignStaffApi,
    getAvailableStaffApi,
    createScheduleApi,
    getAllRoutesApi,
    getAllTrainsApi,
    getStationsByRouteApi
} from '../../services/trainApi';

// Icon nhỏ dùng cho trạng thái
const CheckCircle2 = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></svg>
);

const TrainScheduling = () => {
    // --- 1. STATE QUẢN LÝ ---

    // State Modal
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

    // State Tab & Filter
    const [activeMainTab, setActiveMainTab] = useState('schedule');
    const [filterStatus, setFilterStatus] = useState('all');

    // State Dữ liệu chính
    const [trips, setTrips] = useState([]);
    const [unassignedTripsList, setUnassignedTripsList] = useState([]);
    const [loading, setLoading] = useState(false);

    // State Dữ liệu Danh mục (Lấy từ API)
    const [routesList, setRoutesList] = useState([]);
    const [trainsList, setTrainsList] = useState([]);
    const [availableStations, setAvailableStations] = useState([]);

    // State Chi tiết
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [selectedAssignTrip, setSelectedAssignTrip] = useState(null);

    // State Form Phân công
    const [assignmentState, setAssignmentState] = useState({
        driverId: '',
        managerId: '',
        carriageStaffs: {}
    });

    // [NEW] State Loading riêng cho từng nút phân công (để hiển thị xoay vòng)
    // Cấu trúc: { 'driver': true, 'carriage-1': false, ... }
    const [assigningLoading, setAssigningLoading] = useState({});

    const [availableDrivers, setAvailableDrivers] = useState([]);
    const [availableManagers, setAvailableManagers] = useState([]);
    const [availableStaffs, setAvailableStaffs] = useState([]);

    // State Form Tạo mới
    const [formData, setFormData] = useState({
        maTuyenTau: '', maDoanTau: '', gaXuatPhat: '', gaKetThuc: '',
        ngayKhoiHanh: '', gioKhoiHanh: ''
    });

    const [searchTerm, setSearchTerm] = useState('');

    // --- 2. EFFECTS: LOAD DỮ LIỆU ---

    useEffect(() => {
        if (activeMainTab === 'schedule') fetchSchedule();
    }, [activeMainTab, filterStatus]);

    useEffect(() => {
        if (activeMainTab === 'unassigned') fetchUnassigned();
    }, [activeMainTab]);

    useEffect(() => {
        if (isCreateModalOpen) {
            fetchMasterData();
        }
    }, [isCreateModalOpen]);

    const fetchSchedule = async () => {
        try {
            setLoading(true);
            const res = await getTrainScheduleApi(filterStatus);
            if (res && res.success) setTrips(res.data);
        } catch (error) {
            // toast.error("Lỗi tải lịch trình");
        } finally {
            setLoading(false);
        }
    };

    const fetchUnassigned = async () => {
        try {
            setLoading(true);
            const res = await getUnassignedTripsApi();
            if (res && res.success) setUnassignedTripsList(res.data);
        } catch (error) {
            toast.error("Lỗi tải danh sách chưa phân công.");
        } finally {
            setLoading(false);
        }
    };

    const fetchMasterData = async () => {
        try {
            const [resRoutes, resTrains] = await Promise.all([
                getAllRoutesApi(),
                getAllTrainsApi()
            ]);
            if (resRoutes.success) setRoutesList(resRoutes.data);
            if (resTrains.success) setTrainsList(resTrains.data);
        } catch (error) {
            console.error("Lỗi tải danh mục:", error);
            toast.error("Không thể tải danh sách Tuyến/Tàu.");
        }
    };

    // --- 3. LOGIC MODAL TIMELINE ---
    const handleOpenDetail = async (trip) => {
        try {
            const res = await getTripTimelineApi(trip.id);
            if (res && res.success) {
                setSelectedTrip({ ...trip, timeline: res.data });
                setIsDetailModalOpen(true);
            }
        } catch (error) {
            toast.error("Không thể lấy chi tiết hành trình.");
        }
    };

    const handleTimelineUpdate = (index, field, value) => {
        if (!selectedTrip) return;
        const updatedTimeline = [...selectedTrip.timeline];
        updatedTimeline[index][field] = value;
        setSelectedTrip({ ...selectedTrip, timeline: updatedTimeline });
    };

    const handleSaveTimeline = async () => {
        if (!selectedTrip) return;
        try {
            const promises = selectedTrip.timeline.map(point => {
                if (point.actArr || point.actDep) {
                    return updateTripTimeApi(selectedTrip.id, {
                        stationId: point.stationId,
                        actArr: point.actArr,
                        actDep: point.actDep
                    });
                }
                return null;
            });
            await Promise.all(promises);
            toast.success("Cập nhật hành trình thành công!");
            setIsDetailModalOpen(false);
            fetchSchedule();
        } catch (error) {
            toast.error("Lỗi khi lưu hành trình.");
        }
    };

    // --- 4. LOGIC MODAL PHÂN CÔNG ---
    const handleOpenAssignModal = async (trip) => {
        setSelectedAssignTrip(trip);
        setAssignmentState({ driverId: '', managerId: '', carriageStaffs: {} });
        setAssigningLoading({}); // Reset loading state
        setIsAssignModalOpen(true);

        try {
            const currentAssignRes = await getTripAssignmentsApi(trip.id);

            const currentData = currentAssignRes.success ? currentAssignRes.data : {};

            setSelectedAssignTrip(prev => ({
                ...prev,
                assignedDriverName: currentData.driver,
                assignedDriverId: currentData.driverId,
                assignedManagerName: currentData.manager,
                assignedManagerId: currentData.managerId,
                assignedCarriages: currentData.carriages || {}
            }));

            const [resDrivers, resManagers, resStaffs] = await Promise.all([
                getAvailableStaffApi(trip.id, 'Nhân viên phụ trách lái'),
                getAvailableStaffApi(trip.id, 'Nhân viên trưởng'),
                getAvailableStaffApi(trip.id, 'Nhân viên phụ trách toa')
            ]);

            if (resDrivers.success) setAvailableDrivers(resDrivers.data);
            if (resManagers.success) setAvailableManagers(resManagers.data);
            if (resStaffs.success) setAvailableStaffs(resStaffs.data);

        } catch (error) {
            console.error(error);
            toast.error("Lỗi tải thông tin phân công.");
        }
    };
    const formatDisplay = (isoStr) => {
        if (!isoStr) return '--:--';
        const d = new Date(isoStr);
        return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')} ${d.getDate()}/${d.getMonth() + 1}`;
    };

    const formatInput = (isoStr) => {
        if (!isoStr) return "";
        const d = new Date(isoStr);
        const tzOffset = d.getTimezoneOffset() * 60000;
        return (new Date(d - tzOffset)).toISOString().slice(0, 16);
    };

    const handleRouteChange = async (e) => {
        const routeId = e.target.value;
        setFormData({
            ...formData,
            maTuyenTau: routeId,
            gaXuatPhat: '',
            gaKetThuc: ''
        });

        if (routeId) {
            try {
                const res = await getStationsByRouteApi(routeId);
                if (res && res.success) {
                    setAvailableStations(res.data);
                }
            } catch (error) {
                console.error("Lỗi tải ga:", error);
                toast.error("Không thể tải danh sách ga của tuyến này.");
                setAvailableStations([]);
            }
        } else {
            setAvailableStations([]);
        }
    };

    const filteredTrips = trips.filter(trip => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
            trip.id?.toLowerCase().includes(term) ||          // Search by Trip ID (e.g., CT003)
            trip.route?.toLowerCase().includes(term) ||       // Search by Route (e.g., Hà Nội)
            trip.trainCode?.toLowerCase().includes(term) ||   // Search by Train Code (e.g., SE1)
            trip.date?.includes(term) ||                      // Search by Date (e.g., 2025-12-28)
            trip.time?.includes(term)                         // Search by Time (e.g., 19:00)
        );
    });

    // --- [UPDATED] LOGIC PHÂN CÔNG VỚI LOADING ---
    const confirmAssignment = async (type, index = null) => {
        if (!selectedAssignTrip) return;

        // Xác định key để hiển thị loading cho đúng nút
        const loadingKey = type === 'carriage' ? `carriage-${index}` : type;

        let payload = {
            maChuyenTau: selectedAssignTrip.id,
            maNV: '',
            vaiTro: '',
            maToa: null
        };

        if (type === 'driver') {
            if (!assignmentState.driverId) return toast.warning("Vui lòng chọn lái tàu.");
            payload.maNV = assignmentState.driverId;
            payload.vaiTro = "Nhân viên phụ trách lái";
        } else if (type === 'manager') {
            if (!assignmentState.managerId) return toast.warning("Vui lòng chọn trưởng tàu.");
            payload.maNV = assignmentState.managerId;
            payload.vaiTro = "Nhân viên trưởng";
        } else if (type === 'carriage') {
            const staffId = assignmentState.carriageStaffs[index];
            if (!staffId) return toast.warning("Vui lòng chọn nhân viên cho toa này.");
            payload.maNV = staffId;
            payload.vaiTro = "Nhân viên phụ trách toa";

            const carriageInfo = selectedAssignTrip.assignedCarriages[index];
            if (carriageInfo && carriageInfo.coachId) {
                payload.maToa = carriageInfo.coachId + '0';
            } else {
                payload.maToa = index.toString() + '0';
            }
        }

        try {
            // Bật loading cho key tương ứng
            setAssigningLoading(prev => ({ ...prev, [loadingKey]: true }));

            const res = await assignStaffApi(payload);
            if (res && res.success) {
                toast.success("Phân công thành công!");
                // Tải lại dữ liệu phân công để cập nhật UI
                handleOpenAssignModal(selectedAssignTrip);
                // Cập nhật lại list bên ngoài
                fetchUnassigned();
            } else {
                // Hiển thị lỗi từ server trả về nếu success = false
                toast.error(res.message || "Phân công thất bại. Vui lòng thử lại.");
            }
        } catch (error) {
            // Hiển thị lỗi Exception (Mạng, Server 500...)
            console.error("Lỗi phân công:", error);
            toast.error(error.response?.data?.message || "Lỗi server khi phân công.");
        } finally {
            // Tắt loading bất kể thành công hay thất bại
            setAssigningLoading(prev => ({ ...prev, [loadingKey]: false }));
        }
    };

    // --- 5. LOGIC TẠO MỚI ---
    const handleCreateSubmit = async () => {
        if (!formData.maTuyenTau || !formData.maDoanTau || !formData.ngayKhoiHanh) {
            return toast.warning("Vui lòng nhập đủ thông tin.");
        }

        try {
            const fullDate = `${formData.ngayKhoiHanh}T${formData.gioKhoiHanh || '00:00'}:00`;
            const payload = {
                maTuyenTau: formData.maTuyenTau,
                maDoanTau: formData.maDoanTau,
                gaXuatPhat: formData.gaXuatPhat,
                gaKetThuc: formData.gaKetThuc,
                ngayKhoiHanh: fullDate
            };

            const res = await createScheduleApi(payload);
            if (res.success) {
                toast.success("Tạo chuyến tàu thành công!");
                setIsCreateModalOpen(false);
                setFormData({ maTuyenTau: '', maDoanTau: '', gaXuatPhat: '', gaKetThuc: '', ngayKhoiHanh: '', gioKhoiHanh: '' });
                fetchSchedule();
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Lỗi tạo chuyến tàu.");
        }
    };

    const getCarriageCount = (trainCode) => {
        if (!trainCode) return 8;
        const train = trainsList.find(t => t.TenTau === trainCode || t.MaDoanTau === trainCode);
        if (trainCode.includes('LP')) return 4;
        return 8;
    };

    // --- 7. RENDER GIAO DIỆN ---
    return (
        <div className="min-h-screen bg-gray-50 p-6 font-sans">

            {/* HEADER DASHBOARD */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Quản lý điều hành</h1>
                    <p className="text-gray-500 text-sm mt-1">Phân công và theo dõi các chuyến tàu</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium shadow-sm hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-5 h-5" /> Lập chuyến mới
                </button>
            </div>

            {/* --- TAB NAVIGATION --- */}
            <div className="flex gap-4 mb-6 border-b border-gray-200">
                <button
                    onClick={() => setActiveMainTab('schedule')}
                    className={`pb-3 px-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${activeMainTab === 'schedule' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    <Calendar className="w-4 h-4" /> Lịch trình chạy tàu
                </button>
                <button
                    onClick={() => setActiveMainTab('unassigned')}
                    className={`pb-3 px-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors relative ${activeMainTab === 'unassigned' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    <Briefcase className="w-4 h-4" /> Chuyến chưa phân công
                    {unassignedTripsList.length > 0 && <span className="ml-1 bg-orange-100 text-orange-600 text-xs px-2 py-0.5 rounded-full">{unassignedTripsList.length}</span>}
                </button>
            </div>

            {/* --- TAB 1: LỊCH TRÌNH --- */}
            {activeMainTab === 'schedule' && (
                <div className="animate-in fade-in duration-300">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                        <div className="relative w-full md:w-96">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                                placeholder="Tìm theo mã chuyến, tên tàu, giờ đi..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
                            {[{ id: 'all', label: 'Tất cả' }, { id: 'Đang chạy', label: 'Đang chạy' }, { id: 'Chuẩn bị', label: 'Chuẩn bị' }, { id: 'Hoàn thành', label: 'Hoàn thành' }, { id: 'Hủy', label: 'Đã hủy' }].map(tab => (
                                <button
                                    key={tab.id} onClick={() => setFilterStatus(tab.id)}
                                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${filterStatus === tab.id ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-50'}`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

{loading ? (
    <div className="flex justify-center py-10">
        <Loader className="animate-spin text-blue-600" />
    </div>
) : (
    <div className="space-y-4">
        {/* CASE 1: No results found after filtering */}
        {filteredTrips.length === 0 ? (
            <div className="text-center text-gray-500 py-10 bg-white rounded-xl border border-dashed border-gray-300">
                Không tìm thấy chuyến tàu nào phù hợp.
            </div>
        ) : (
            /* CASE 2: Map through filteredTrips */
            filteredTrips.map((trip) => (
                <div
                    key={trip.id}
                    onClick={() => handleOpenDetail(trip)}
                    className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col md:flex-row justify-between items-center shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                >
                    {/* LEFT SIDE: Icon & Route Info */}
                    <div className="flex items-start gap-4 mb-4 md:mb-0 w-full md:w-auto">
                        {/* Status Icon with "Hủy" logic */}
                        <div className={`p-3 rounded-lg shrink-0 ${
                            trip.status === 'Đang chạy' ? 'bg-green-100 text-green-600' :
                            trip.status === 'Hủy' ? 'bg-red-50 text-red-500' : 
                            'bg-blue-50 text-blue-600'
                        }`}>
                             {trip.status === 'Hủy' ? <X className="w-8 h-8" /> : <Train className="w-8 h-8" />}
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-gray-800">{trip.route}</h3>
                            <div className="text-gray-500 text-sm flex flex-col gap-1 mt-1">
                                <span className="flex items-center gap-1 font-medium">
                                    {trip.departureStation} <ArrowRight className="w-3 h-3" /> {trip.arrivalStation}
                                </span>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">
                                        {trip.id}
                                    </span>
                                    <span className="text-gray-500 text-xs">
                                        • {trip.trainCode} • {trip.time}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT SIDE: Staff Info */}
                    <div className="flex items-center gap-8 w-full md:w-auto border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-8">
                        <div>
                            <div className="text-xs text-gray-400 mb-1">Lái tàu</div>
                            <div className={`text-sm font-medium ${trip.driver ? 'text-gray-700' : 'text-orange-500 italic'}`}>
                                {trip.driver || "Chưa có"}
                            </div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-400 mb-1">Trưởng tàu</div>
                            <div className={`text-sm font-medium ${trip.manager ? 'text-gray-700' : 'text-orange-500 italic'}`}>
                                {trip.manager || "Chưa có"}
                            </div>
                        </div>
                    </div>
                </div>
            ))
        )}
    </div>
)}
                </div>
            )}

            {/* --- TAB 2: UNASSIGNED --- */}
            {activeMainTab === 'unassigned' && (
                <div className="animate-in fade-in duration-300">
                    <div className="grid grid-cols-1 gap-4">
                        {loading ? <div className="flex justify-center py-10"><Loader className="animate-spin text-orange-600" /></div> :
                            unassignedTripsList.length === 0 ? (
                                <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-300 text-gray-400">
                                    <Check className="w-10 h-10 mx-auto mb-2 opacity-50" />
                                    <p>Tất cả các chuyến đã được phân công đầy đủ nhân sự!</p>
                                </div>
                            ) : (
                                unassignedTripsList.map(trip => (
                                    <div
                                        key={trip.id}
                                        onClick={() => handleOpenAssignModal(trip)}
                                        className="bg-white rounded-xl border border-orange-200 p-6 shadow-sm hover:shadow-md hover:border-orange-300 transition-all cursor-pointer relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 bg-orange-100 text-orange-600 text-xs font-bold px-3 py-1 rounded-bl-lg">Cần phân công</div>
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-orange-50 text-orange-600 rounded-lg"><Users className="w-6 h-6" /></div>
                                            <div className="flex-1">
                                                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">{trip.route} <span className="text-sm font-normal text-gray-500">({trip.trainCode})</span></h3>
                                                <p className="text-sm text-gray-500 mt-1 flex gap-4"><span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {trip.date}</span> <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {trip.time}</span></p>

                                                <div className="mt-2 flex gap-2 text-xs">
                                                    <span className={`px-2 py-0.5 rounded ${trip.HasDriver ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>Lái: {trip.HasDriver ? 'OK' : 'Thiếu'}</span>
                                                    <span className={`px-2 py-0.5 rounded ${trip.HasManager ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>Trưởng: {trip.HasManager ? 'OK' : 'Thiếu'}</span>
                                                    <span className={`px-2 py-0.5 rounded ${trip.AssignedCarriages >= trip.TotalCarriages ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>Toa: {trip.AssignedCarriages}/{trip.TotalCarriages}</span>
                                                </div>
                                            </div>
                                            <button className="hidden md:block px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg">Phân công ngay</button>
                                        </div>
                                    </div>
                                ))
                            )}
                    </div>
                </div>
            )}

            {/* --- MODAL 1: TẠO CHUYẾN MỚI --- */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h2 className="text-xl font-bold text-gray-800">Lập lịch chuyến tàu mới</h2>
                            <button onClick={() => setIsCreateModalOpen(false)}><X className="w-6 h-6 text-gray-400 hover:text-gray-600" /></button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="bg-blue-50 p-4 rounded-lg flex gap-3 text-blue-800 text-sm">
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                <div>Thông tin nhân sự sẽ được phân công sau tại mục "Chuyến chưa phân công".</div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tuyến tàu</label>
                                    <select
                                        className="w-full border p-2.5 rounded-lg"
                                        onChange={handleRouteChange}
                                        value={formData.maTuyenTau}
                                    >
                                        <option value="">-- Chọn tuyến --</option>
                                        {routesList.map(r => (
                                            // NEW CODE (Correct keys: id, name)
                                            <option key={r.id} value={r.id}>
                                                {r.name} ({r.code})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Đoàn tàu</label>
                                    <select className="w-full border p-2.5 rounded-lg" onChange={(e) => setFormData({ ...formData, maDoanTau: e.target.value })}>
                                        <option value="">-- Chọn tàu --</option>
                                        {trainsList
                                            .filter(train => train.TrangThai === 'Hoạt động') // Filter for Active trains only
                                            .map(t => (
                                                <option key={t.MaDoanTau} value={t.MaDoanTau}>
                                                    {t.TenTau} ({t.MaDoanTau}) - {t.LoaiTau}
                                                </option>
                                            ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ga Xuất Phát</label>
                                    <select
                                        className="w-full border p-2.5 rounded-lg"
                                        onChange={(e) => setFormData({ ...formData, gaXuatPhat: e.target.value })}
                                        value={formData.gaXuatPhat}
                                        disabled={!formData.maTuyenTau}
                                    >
                                        <option value="">-- Chọn ga --</option>
                                        {availableStations.map(s => (
                                            <option key={s.MaGaTau} value={s.MaGaTau}>
                                                {s.TenGa}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ga Kết Thúc</label>
                                    <select
                                        className="w-full border p-2.5 rounded-lg"
                                        onChange={(e) => setFormData({ ...formData, gaKetThuc: e.target.value })}
                                        value={formData.gaKetThuc}
                                        disabled={!formData.maTuyenTau}
                                    >
                                        <option value="">-- Chọn ga --</option>
                                        {availableStations.map(s => (
                                            <option key={s.MaGaTau} value={s.MaGaTau}>
                                                {s.TenGa}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày đi</label>
                                    <input type="date" className="w-full border p-2.5 rounded-lg" onChange={(e) => setFormData({ ...formData, ngayKhoiHanh: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Giờ đi</label>
                                    <input type="time" className="w-full border p-2.5 rounded-lg" onChange={(e) => setFormData({ ...formData, gioKhoiHanh: e.target.value })} />
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t">
                            <button onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 border rounded-lg text-gray-600">Hủy</button>
                            <button onClick={handleCreateSubmit} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">Tạo chuyến</button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL 2: CHI TIẾT TIMELINE */}
            {isDetailModalOpen && selectedTrip && (
                <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">{selectedTrip.route}</h2>
                                <p className="text-sm text-gray-500 flex items-center gap-2">
                                    {selectedTrip.trainCode} • {selectedTrip.date}
                                </p>
                            </div>
                            <button onClick={() => setIsDetailModalOpen(false)}><X className="w-6 h-6 text-gray-400 hover:text-gray-600" /></button>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto p-6 bg-white">
                            <h3 className="font-bold text-gray-800 mb-6">Chi tiết hành trình thực tế</h3>
                            <div className="relative pl-4 space-y-0">
                                {selectedTrip.timeline && selectedTrip.timeline.length > 0 ? (
                                    selectedTrip.timeline.map((point, index) => {
                                        const isPassed = point.status === 'passed';
                                        const isCurrent = point.status === 'current';
                                        const lineColor = isPassed ? 'border-blue-500' : 'border-gray-200';
                                        const iconColor = isPassed ? 'bg-blue-500 text-white' : isCurrent ? 'bg-orange-500 text-white' : 'bg-white border-2 border-gray-300 text-gray-400';

                                        return (
                                            <div key={index} className={`relative pl-8 pb-8 ${index !== selectedTrip.timeline.length - 1 ? 'border-l-2 ' + lineColor : ''}`}>
                                                <div className={`absolute -left-[9px] top-0 w-5 h-5 rounded-full flex items-center justify-center z-10 ${iconColor}`}>
                                                    {isPassed ? <Check size={12} /> : isCurrent ? <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div> : <div className="w-2 h-2 bg-gray-300 rounded-full"></div>}
                                                </div>
                                                <div className={`p-4 rounded-xl border ${isCurrent ? 'border-orange-200 bg-orange-50 shadow-sm' : 'border-gray-100 bg-white hover:bg-gray-50'} transition-all`}>
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h4 className="font-bold text-gray-800 text-lg">{point.station}</h4>
                                                        {isPassed && <span className="text-xs font-bold text-white bg-green-500 px-2 py-1 rounded-full">Đã qua</span>}
                                                        {isCurrent && <span className="text-xs font-bold text-white bg-orange-500 px-2 py-1 rounded-full animate-pulse">Đang ở đây</span>}
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                                        <div>
                                                            <div className="text-gray-500 text-xs mb-1 font-semibold">Giờ đến (Dự kiến / Thực tế)</div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded text-xs whitespace-nowrap">
                                                                    {formatDisplay(point.expArr)}
                                                                </span>
                                                                <span className="text-gray-400">→</span>
                                                                <input
                                                                    type="datetime-local"
                                                                    className="border border-gray-300 rounded px-2 py-1 text-xs text-blue-600 font-bold focus:outline-none focus:border-blue-500 bg-white w-44"
                                                                    value={formatInput(point.actArr)}
                                                                    onChange={(e) => handleTimelineUpdate(index, 'actArr', e.target.value)}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="text-gray-500 text-xs mb-1 font-semibold">Giờ đi (Dự kiến / Thực tế)</div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded text-xs whitespace-nowrap">
                                                                    {formatDisplay(point.expDep)}
                                                                </span>
                                                                <span className="text-gray-400">→</span>
                                                                <input
                                                                    type="datetime-local"
                                                                    className="border border-gray-300 rounded px-2 py-1 text-xs text-orange-600 font-bold focus:outline-none focus:border-orange-500 bg-white w-44"
                                                                    value={formatInput(point.actDep)}
                                                                    onChange={(e) => handleTimelineUpdate(index, 'actDep', e.target.value)}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-gray-500 text-center py-4">Chưa có thông tin lộ trình chi tiết.</div>
                                )}
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                            <button onClick={() => setIsDetailModalOpen(false)} className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-white">Đóng</button>
                            <button onClick={handleSaveTimeline} className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2">
                                <Save className="w-4 h-4" /> Lưu cập nhật
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL 3: PHÂN CÔNG (ĐÃ CẬP NHẬT UI LOADING) --- */}
            {isAssignModalOpen && selectedAssignTrip && (
                <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200 shadow-2xl">
                        {/* Header Modal */}
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-orange-50">
                            <div><h2 className="text-xl font-bold text-gray-800">Phân công nhân sự</h2><p className="text-sm text-gray-600">{selectedAssignTrip.route} - {selectedAssignTrip.trainCode}</p></div>
                            <button onClick={() => setIsAssignModalOpen(false)}><X className="w-6 h-6 text-gray-400 hover:text-gray-600" /></button>
                        </div>
                        {/* Body Modal */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-gray-50/50">

                            {/* 1. Lái tàu & Trưởng tàu */}
                            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
                                    <User className="w-5 h-5 text-blue-600" /> Vị trí chủ chốt
                                </h3>
                                <div className="space-y-4">

                                    {/* LÁI TÀU */}
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="w-1/3">
                                            <label className="font-medium text-sm text-gray-700">Lái tàu</label>
                                        </div>
                                        <div className="flex-1">
                                            {selectedAssignTrip.assignedDriverId ? (
                                                <div className="flex items-center justify-between bg-green-50 border border-green-200 text-green-800 px-4 py-2 rounded-lg">
                                                    <span className="font-medium text-sm">
                                                        {selectedAssignTrip.assignedDriverName}
                                                        <span className="text-green-600 font-normal ml-1">({selectedAssignTrip.assignedDriverId})</span>
                                                    </span>
                                                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                                                </div>
                                            ) : (
                                                <div className="flex gap-2">
                                                    <select
                                                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 transition-colors"
                                                        value={assignmentState.driverId}
                                                        onChange={(e) => setAssignmentState({ ...assignmentState, driverId: e.target.value })}
                                                        disabled={assigningLoading['driver']} // Disable khi đang load
                                                    >
                                                        <option value="">-- Chọn lái tàu --</option>
                                                        {availableDrivers.map(d => (
                                                            <option key={d.MaNV} value={d.MaNV}>{d.HoTen} ({d.MaNV})</option>
                                                        ))}
                                                    </select>
                                                    <button
                                                        onClick={() => confirmAssignment('driver')}
                                                        className={`px-3 rounded-lg flex items-center justify-center transition-colors shadow-sm ${assigningLoading['driver'] ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                                                        title="Lưu phân công"
                                                        disabled={assigningLoading['driver']} // Disable khi đang load
                                                    >
                                                        {assigningLoading['driver'] ? (
                                                            <Loader className="w-5 h-5 animate-spin text-white" />
                                                        ) : (
                                                            <Check className="w-5 h-5" />
                                                        )}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* TRƯỞNG TÀU */}
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="w-1/3">
                                            <label className="font-medium text-sm text-gray-700">Trưởng tàu</label>
                                        </div>
                                        <div className="flex-1">
                                            {selectedAssignTrip.assignedManagerId ? (
                                                <div className="flex items-center justify-between bg-green-50 border border-green-200 text-green-800 px-4 py-2 rounded-lg">
                                                    <span className="font-medium text-sm">
                                                        {selectedAssignTrip.assignedManagerName}
                                                        <span className="text-green-600 font-normal ml-1">({selectedAssignTrip.assignedManagerId})</span>
                                                    </span>
                                                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                                                </div>
                                            ) : (
                                                <div className="flex gap-2">
                                                    <select
                                                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 transition-colors"
                                                        value={assignmentState.managerId}
                                                        onChange={(e) => setAssignmentState({ ...assignmentState, managerId: e.target.value })}
                                                        disabled={assigningLoading['manager']} // Disable khi đang load
                                                    >
                                                        <option value="">-- Chọn trưởng tàu --</option>
                                                        {availableManagers.map(m => (
                                                            <option key={m.MaNV} value={m.MaNV}>{m.HoTen} ({m.MaNV})</option>
                                                        ))}
                                                    </select>
                                                    <button
                                                        onClick={() => confirmAssignment('manager')}
                                                        className={`px-3 rounded-lg flex items-center justify-center transition-colors shadow-sm ${assigningLoading['manager'] ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                                                        disabled={assigningLoading['manager']} // Disable khi đang load
                                                    >
                                                        {assigningLoading['manager'] ? (
                                                            <Loader className="w-5 h-5 animate-spin text-white" />
                                                        ) : (
                                                            <Check className="w-5 h-5" />
                                                        )}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 2. Phụ trách toa */}
                            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
                                    <Users className="w-5 h-5 text-orange-600" /> Phụ trách toa xe
                                </h3>

                                {/* Render danh sách toa xe */}
                                <div className="space-y-3">
                                    {selectedAssignTrip.assignedCarriages && Object.keys(selectedAssignTrip.assignedCarriages).length > 0 ? (
                                        Object.entries(selectedAssignTrip.assignedCarriages).map(([carriageNum, assignedData]) => {
                                            const isAssigned = assignedData && assignedData.staffId;
                                            const staffName = assignedData ? assignedData.staffName : '';

                                            // Key loading động cho từng toa
                                            const loadingKey = `carriage-${carriageNum}`;
                                            const isLoading = assigningLoading[loadingKey];

                                            return (
                                                <div key={carriageNum} className="flex items-center justify-between gap-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 px-2 rounded-lg transition-colors">
                                                    <div className="w-1/3 flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${isAssigned ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                                                            {carriageNum}
                                                        </div>
                                                        <span className="font-medium text-sm text-gray-700">Toa số {carriageNum}</span>
                                                    </div>

                                                    <div className="flex-1">
                                                        {isAssigned ? (
                                                            <div className="flex items-center justify-between text-sm">
                                                                <span className="font-bold text-gray-800">{staffName}</span>
                                                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center gap-1">
                                                                    <CheckCircle2 className="w-3 h-3" /> Đã gán
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <div className="flex gap-2">
                                                                <select
                                                                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-500 transition-colors"
                                                                    value={assignmentState.carriageStaffs[carriageNum] || ''}
                                                                    onChange={(e) => setAssignmentState({ ...assignmentState, carriageStaffs: { ...assignmentState.carriageStaffs, [carriageNum]: e.target.value } })}
                                                                    disabled={isLoading}
                                                                >
                                                                    <option value="">-- Chọn nhân viên --</option>
                                                                    {availableStaffs.map(s => (
                                                                        <option key={s.MaNV} value={s.MaNV}>{s.HoTen} ({s.MaNV})</option>
                                                                    ))}
                                                                </select>
                                                                <button
                                                                    onClick={() => confirmAssignment('carriage', carriageNum)}
                                                                    className={`px-3 rounded-lg flex items-center justify-center transition-colors shadow-sm ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600 text-white'}`}
                                                                    disabled={isLoading}
                                                                >
                                                                    {isLoading ? (
                                                                        <Loader className="w-5 h-5 animate-spin text-white" />
                                                                    ) : (
                                                                        <Check className="w-5 h-5" />
                                                                    )}
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="text-center text-gray-400 py-4 italic">Không có dữ liệu toa xe</div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 border-t flex justify-end"><button onClick={() => setIsAssignModalOpen(false)} className="px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium text-gray-700">Đóng</button></div>
                    </div>
                </div>
            )}
            <ToastContainer position="top-right" autoClose={3000} />
        </div>
    );
};

export default TrainScheduling;