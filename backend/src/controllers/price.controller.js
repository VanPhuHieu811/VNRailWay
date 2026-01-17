import * as priceService from '../services/price.service.js';

// lay tat ca cac gia cua toa tau
export const getAllTrainCarriagePrices = async (req, res) => {
  try {
    const prices = await priceService.getAllTrainCarriagePrices();

    if (!prices) {
      return res.status(404).json({
        success: false,
        message: 'No prices found',
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Prices retrieved successfully',
      data: prices,
    });
  }
  catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}

export const getTrainCarriagePriceById = async (req, res) => {
  try {
    const id = req.params.id;
    const price = await priceService.getTrainCarriagePriceById(id);

    if (!price) {
      return res.status(404).json({
        success: false,
        message: 'Price not found',
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Price retrieved successfully',
      data: price,
    });
  }
  catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}

export const updateTrainCarriagePriceById = async (req, res) => {
  try {
    const id = req.params.id;
    const {price} = req.body
    
    const updatedPrice = await priceService.updateTrainCarriagePriceById(id, price);

    if (!updatedPrice) {
      return res.status(404).json({
        success: false,
        message: 'Price not found or no changes made',
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Price updated successfully',
      data: updatedPrice,
    });
  }
  catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}

// tang
export const getAllTrainFloorPrices = async (req, res) => {
  try {
    const prices = await priceService.getAllTrainFloorPrices();

    if (!prices) {
      return res.status(404).json({
        success: false,
        message: 'No prices found',
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Prices retrieved successfully',
      data: prices,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}

export const getTrainFloorPriceById = async (req, res) => {
  try {
    const id = req.params.id;
    const price = await priceService.getTrainFloorPriceById(id);

    if (!price) {
      return res.status(404).json({
        success: false,
        message: 'Price not found',
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Price retrieved successfully',
      data: price,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}

export const updateTrainFloorPriceById = async (req, res) => {
  try {
    const id = req.params.id;
    const {price} = req.body

    const updatedPrice = await priceService.updateTrainFloorPriceById(id, price);

    if (!updatedPrice) {
      return res.status(404).json({
        success: false,
        message: 'Price not found or no changes made',
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Price updated successfully',
      data: updatedPrice,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}

// loai tau
export const getAllTrainTypePrices = async (req, res) => {
  try {
    const prices = await priceService.getAllTrainTypePrices();

    if (!prices) {
      return res.status(404).json({
        success: false,
        message: 'No prices found',
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Prices retrieved successfully',
      data: prices,
    });
  }
  catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}

export const getTrainTypePriceById = async (req, res) => {
  try {
    const id = req.params.id;
    const price = await priceService.getTrainTypePriceById(id);

    if (!price) {
      return res.status(404).json({
        success: false,
        message: 'Price not found',
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Price retrieved successfully',
      data: price,
    });
  }
  catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}

export const updateTrainTypePriceById = async (req, res) => {
  try {
    const id = req.params.id;
    const {price} = req.body

    const updatedPrice = await priceService.updateTrainTypePriceById(id, price);

    if (!updatedPrice) {
      return res.status(404).json({
        success: false,
        message: 'Price not found or no changes made',
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Price updated successfully',
      data: updatedPrice,
    });
  }
  catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}

export const getAllPriceByKilometer = async (req, res) => {
  try {
    const prices = await priceService.getAllPriceByKilometer();

    if (!prices) {
      return res.status(404).json({
        success: false,
        message: 'No prices found',
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Prices retrieved successfully',
      data: prices,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}

export const getPriceByKilometerById = async (req, res) => {
  try {
    const id = req.params.id;
    const price = await priceService.getPriceByKilometerById(id);

    if (!price) {
      return res.status(404).json({
        success: false,
        message: 'Price not found',
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Price retrieved successfully',
      data: price,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}

export const updatePriceByKilometerById = async (req, res) => {
  try {
    const id = req.params.id;
    const {price} = req.body

    const updatedPrice = await priceService.updatePriceByKilometerById(id, price);

    if (!updatedPrice) {
      return res.status(404).json({
        success: false,
        message: 'Price not found or no changes made',
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Price updated successfully',
      data: updatedPrice,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}

export const calculatePrice = async (req, res) => {
    try {
        const { tripId, fromStationId, toStationId, seatId, promotionCode } = req.body;

        if (!tripId || !fromStationId || !toStationId || !seatId) {
            return res.status(400).json({ 
                success: false, 
                message: 'Vui lòng cung cấp đủ thông tin: Chuyến tàu, Ga đi, Ga đến, Vị trí.' 
            });
        }

        const priceData = await priceService.calculateTicketPrice({
            tripId, 
            fromStationId, 
            toStationId, 
            seatId, 
            promotionCode
        });

        if (priceData) {
            return res.status(200).json({
                success: true,
                data: priceData
            });
        } else {
            return res.status(404).json({ 
                success: false, 
                message: 'Không thể tính toán giá vé (Có thể dữ liệu không hợp lệ).' 
            });
        }

    } catch (error) {
        return res.status(500).json({ 
            success: false, 
            message: 'Lỗi server khi tính giá vé.',
            error: error.message 
        });
    }
};