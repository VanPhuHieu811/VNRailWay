import { 
    getAllRoutesService, 
    getRouteDetailService, 
    createRouteService, 
    updateRouteService,
    addStationToRouteService,
    removeStationFromRouteService
} from '../services/route.service.js';

export const getRoutes = async (req, res) => {
    try {
        const routes = await getAllRoutesService();
        return res.status(200).json({ success: true, data: routes });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const getRouteById = async (req, res) => {
    try {
        const { id } = req.params;
        const route = await getRouteDetailService(id);
        if (!route) return res.status(404).json({ success: false, message: 'Route not found' });
        return res.status(200).json({ success: true, data: route });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Create Route Header (e.g., "Hanoi - Saigon")
export const createRoute = async (req, res) => {
    try {
        const data = req.body;
        if (!data.maTuyenTau || !data.tenTuyen) {
            return res.status(400).json({ success: false, message: 'MaTuyenTau and TenTuyen are required' });
        }
        const result = await createRouteService(data);
        return res.status(201).json({ success: true, message: 'Route created successfully', data: result });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Update Route Header
export const updateRoute = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        await updateRouteService(id, data);
        return res.status(200).json({ success: true, message: 'Route updated successfully' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// [NEW] Add a specific Station to a Route
export const addStationToRoute = async (req, res) => {
    try {
        const { id } = req.params; // Route ID
        const stationData = req.body; // { maGaTau, thuTu, khoangCach }

        if (!stationData.maGaTau || !stationData.thuTu) {
            return res.status(400).json({ success: false, message: 'MaGaTau and ThuTu are required' });
        }

        await addStationToRouteService(id, stationData);
        
        return res.status(201).json({ success: true, message: 'Station added to route successfully' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// [NEW] Remove a specific Station from a Route
export const removeStationFromRoute = async (req, res) => {
    try {
        const { id, stationId } = req.params; // Route ID and Station ID
        await removeStationFromRouteService(id, stationId);
        
        return res.status(200).json({ success: true, message: 'Station removed from route successfully' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};