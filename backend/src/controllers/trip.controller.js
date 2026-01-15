import * as tripService from '../services/trip.service.js';

export const searchTrips = async (req, res) => {
    try {
        const { gaXuatPhat, gaKetThuc, ngayDi, trangThai } = req.query;

        const trips = await tripService.searchTripsService(
            gaXuatPhat,
            gaKetThuc,
            ngayDi,
            trangThai
        );

        return res.status(200).json({ success: true, data: trips });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const getTripSeats = async (req, res) => {
    try {
        const { id } = req.params;

        const seats = await tripService.getTripSeatsService(id);

        if (seats.length === 0) {
            return res.status(404).json({ success: false, message: 'Trip not found' });
        }

        return res.status(200).json({ success: true, data: seats });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const getTripDetails = async (req, res) => {
    try {
        const { id } = req.params;

        const trip = await tripService.getTripDetailsService(id);

        if (!trip) {
            return res.status(404).json({ success: false, message: 'Trip not found' });
        }

        return res.status(200).json({ success: true, data: trip });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
