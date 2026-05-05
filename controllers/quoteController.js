    // controllers/quoteController.js
import QuoteRequest from '../models/QuoteRequest.js';
import BridalCombo from '../models/BridalCombo.js';
import Addon from '../models/Addon.js';

// Create a new quote request
export const createQuoteRequest = async (req, res) => {
  try {
    const { customerDetails, selectedCombo, selectedAddons, estimatedTotal, currency } = req.body;

    // Validate required fields
    if (!customerDetails?.fullName || !customerDetails?.email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Full name and email are required' 
      });
    }

    // Verify combo exists if provided
    if (selectedCombo?.id) {
      const comboExists = await BridalCombo.findById(selectedCombo.id);
      if (!comboExists) {
        return res.status(404).json({ 
          success: false, 
          message: 'Selected combo not found' 
        });
      }
    }

    const quoteRequest = new QuoteRequest({
      customerDetails,
      selectedCombo,
      selectedAddons: selectedAddons || [],
      estimatedTotal,
      currency: currency || 'INR',
      status: 'pending'
    });

    await quoteRequest.save();

    res.status(201).json({
      success: true,
      message: 'Quote request submitted successfully',
      data: quoteRequest
    });
  } catch (error) {
    console.error('Create quote request error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create quote request', 
      error: error.message 
    });
  }
};

// Get all quote requests (admin)
export const getAllQuoteRequests = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    
    if (status) filter.status = status;
    
    const quotes = await QuoteRequest.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('selectedCombo.id', 'name description')
      .populate('selectedAddons.id', 'title price');
    
    const total = await QuoteRequest.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      data: quotes,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch quote requests', 
      error: error.message 
    });
  }
};

// Get single quote request
export const getQuoteRequestById = async (req, res) => {
  try {
    const quote = await QuoteRequest.findById(req.params.id)
      .populate('selectedCombo.id', 'name description discountPercentage')
      .populate('selectedAddons.id', 'title price category');
    
    if (!quote) {
      return res.status(404).json({ 
        success: false, 
        message: 'Quote request not found' 
      });
    }
    
    res.status(200).json({
      success: true,
      data: quote
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch quote request', 
      error: error.message 
    });
  }
};

// Update quote request status
export const updateQuoteStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const validStatuses = ['pending', 'contacted', 'converted', 'expired'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status value' 
      });
    }
    
    const quote = await QuoteRequest.findByIdAndUpdate(
      req.params.id,
      { status, notes },
      { new: true, runValidators: true }
    );
    
    if (!quote) {
      return res.status(404).json({ 
        success: false, 
        message: 'Quote request not found' 
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Quote status updated successfully',
      data: quote
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update quote status', 
      error: error.message 
    });
  }
};

// Delete quote request
export const deleteQuoteRequest = async (req, res) => {
  try {
    const quote = await QuoteRequest.findByIdAndDelete(req.params.id);
    
    if (!quote) {
      return res.status(404).json({ 
        success: false, 
        message: 'Quote request not found' 
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Quote request deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete quote request', 
      error: error.message 
    });
  }
};