import masterService from '../services/master.service.js';

const masterController = {
    getStations: async (req, res) => {
        try {
            const data = await masterService.getAllStations();
            return res.status(200).json({ success: true, data });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    },

    getRoutes: async (req, res) => {
        try {
            const data = await masterService.getAllRoutes();
            return res.status(200).json({ success: true, data });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    },

    getTrains: async (req, res) => {
        try {
            const data = await masterService.getAllTrains();
            return res.status(200).json({ success: true, data });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    },

    // Hàm mới: Lấy ga theo tuyến
    getStationsByRoute: async (req, res) => {
        try {
            const { routeId } = req.params; // Lấy param :routeId từ URL
            const data = await masterService.getStationsByRoute(routeId);
            return res.status(200).json({ success: true, data });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
};

export default masterController;