// controllers/bridalBookingController.js
import BridalBooking from '../models/BridalBooking.js';
import BridalCombo from '../models/BridalCombo.js';
import Addon from '../models/AddOn.js';
import QuoteRequest from '../models/QuoteRequest.js';

// Create new booking from quote
export const createBookingFromQuote = async (req, res) => {
  try {
    const { quoteId, advancePayment, specialRequests, assignedArtist } = req.body;
    
    // Find the quote request
    const quote = await QuoteRequest.findById(quoteId);
    if (!quote) {
      return res.status(404).json({ 
        success: false, 
        message: 'Quote request not found' 
      });
    }
    
    // Calculate balance
    const balanceAmount = quote.estimatedTotal - (advancePayment || 0);
    
    const booking = new BridalBooking({
      customerInfo: {
        name: quote.customerDetails.fullName,
        phoneNumber: quote.customerDetails.phone,
        email: quote.customerDetails.email,
        address: {
          street: quote.customerDetails.address,
          city: quote.customerDetails.city,
          pincode: quote.customerDetails.pincode
        }
      },
      bookingDate: new Date(),
      weddingDate: quote.customerDetails.weddingDate,
      selectedCombo: {
        comboId: quote.selectedCombo.id,
        name: quote.selectedCombo.name,
        price: quote.selectedCombo.price,
        items: quote.selectedCombo.items
      },
      selectedAddons: quote.selectedAddons.map(addon => ({
        addonId: addon.id,
        title: addon.title,
        price: addon.price,
        category: addon.category
      })),
      totalPrice: quote.estimatedTotal,
      advancePayment: advancePayment || 0,
      balanceAmount,
      paymentStatus: advancePayment > 0 ? 'advance_paid' : 'pending',
      bookingStatus: 'confirmed',
      specialRequests,
      assignedArtist
    });
    
    await booking.save();
    
    // Update quote status
    quote.status = 'converted';
    await quote.save();
    
    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create booking', 
      error: error.message 
    });
  }
};

// Create direct booking (without quote)
export const createDirectBooking = async (req, res) => {
  try {
    const {
      customerInfo,
      weddingDate,
      selectedComboId,
      selectedAddonIds,
      specialRequests,
      advancePayment,
      assignedArtist
    } = req.body;
    
    // Validate required fields
    if (!customerInfo?.name || !customerInfo?.email || !customerInfo?.phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Customer name, email, and phone number are required'
      });
    }
    
    // Fetch combo details
    let comboDetails = null;
    let totalPrice = 0;
    
    if (selectedComboId) {
      const combo = await BridalCombo.findById(selectedComboId)
        .populate('items.itemId')
        .lean();
      
      if (!combo) {
        return res.status(404).json({
          success: false,
          message: 'Selected combo not found'
        });
      }
      
      // Calculate combo price
      let totalOriginal = 0;
      combo.items?.forEach(item => {
        const itemData = item.itemId;
        if (itemData) {
          const price = itemData.priceRange?.min || itemData.startingPrice || itemData.price || 0;
          totalOriginal += price * (item.quantity || 1);
        }
      });
      
      const discountAmount = (totalOriginal * (combo.discountPercentage || 0)) / 100;
      const comboPrice = combo.customComboPrice || (totalOriginal - discountAmount);
      totalPrice += comboPrice;
      
      comboDetails = {
        comboId: combo._id,
        name: combo.name,
        price: comboPrice,
        items: combo.items?.map(item => ({
          itemType: item.itemType,
          itemId: item.itemId?._id,
          name: item.itemId?.title || item.itemId?.name,
          price: item.itemId?.priceRange?.min || item.itemId?.startingPrice || 0
        }))
      };
    }
    
    // Fetch addons details
    let addonDetails = [];
    if (selectedAddonIds && selectedAddonIds.length > 0) {
      const addons = await Addon.find({ _id: { $in: selectedAddonIds }, isActive: true });
      addonDetails = addons.map(addon => ({
        addonId: addon._id,
        title: addon.title,
        price: addon.price,
        category: addon.category
      }));
      
      // Add addon prices to total
      addonDetails.forEach(addon => {
        totalPrice += addon.price;
      });
    }
    
    const balanceAmount = totalPrice - (advancePayment || 0);
    
    const booking = new BridalBooking({
      customerInfo: {
        name: customerInfo.name,
        phoneNumber: customerInfo.phoneNumber,
        email: customerInfo.email,
        address: customerInfo.address || {}
      },
      bookingDate: new Date(),
      weddingDate: weddingDate || null,
      selectedCombo: comboDetails,
      selectedAddons: addonDetails,
      totalPrice,
      advancePayment: advancePayment || 0,
      balanceAmount,
      paymentStatus: advancePayment > 0 ? 'advance_paid' : 'pending',
      bookingStatus: 'confirmed',
      specialRequests: specialRequests || '',
      assignedArtist: assignedArtist || ''
    });
    
    await booking.save();
    
    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking
    });
  } catch (error) {
    console.error('Create direct booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create booking',
      error: error.message
    });
  }
};

// Get all bridal bookings
export const getAllBridalBookings = async (req, res) => {
  try {
    const { 
      bookingStatus, 
      paymentStatus, 
      startDate, 
      endDate,
      page = 1, 
      limit = 20 
    } = req.query;
    
    const filter = {};
    
    if (bookingStatus) filter.bookingStatus = bookingStatus;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    
    // Date range filter
    if (startDate || endDate) {
      filter.bookingDate = {};
      if (startDate) filter.bookingDate.$gte = new Date(startDate);
      if (endDate) filter.bookingDate.$lte = new Date(endDate);
    }
    
    const bookings = await BridalBooking.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('selectedCombo.comboId', 'name description discountPercentage')
      .populate('selectedAddons.addonId', 'title price category duration');
    
    const total = await BridalBooking.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      data: bookings,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all bookings error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch bookings', 
      error: error.message 
    });
  }
};

// Get bridal booking by ID
export const getBridalBookingById = async (req, res) => {
  try {
    const booking = await BridalBooking.findById(req.params.id)
      .populate('selectedCombo.comboId', 'name description discountPercentage includesBridalMakeup includesBridalMehendi includesBridalSareeDraping')
      .populate('selectedAddons.addonId', 'title price category duration description');
    
    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Bridal booking not found' 
      });
    }
    
    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Get booking by ID error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch booking', 
      error: error.message 
    });
  }
};

// Get bookings by customer email or phone
export const getBridalBookingsByCustomer = async (req, res) => {
  try {
    const { email, phoneNumber } = req.query;
    
    if (!email && !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Either email or phone number is required'
      });
    }
    
    const filter = {};
    if (email) filter['customerInfo.email'] = email;
    if (phoneNumber) filter['customerInfo.phoneNumber'] = phoneNumber;
    
    const bookings = await BridalBooking.find(filter)
      .sort({ createdAt: -1 })
      .populate('selectedCombo.comboId', 'name')
      .populate('selectedAddons.addonId', 'title');
    
    res.status(200).json({
      success: true,
      data: bookings,
      count: bookings.length
    });
  } catch (error) {
    console.error('Get customer bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer bookings',
      error: error.message
    });
  }
};

// Update bridal booking status
export const updateBridalBookingStatus = async (req, res) => {
  try {
    const { bookingStatus, paymentStatus, notes, assignedArtist } = req.body;
    const updateData = {};
    
    if (bookingStatus) {
      const validStatuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];
      if (!validStatuses.includes(bookingStatus)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid booking status'
        });
      }
      updateData.bookingStatus = bookingStatus;
    }
    
    if (paymentStatus) {
      const validPayments = ['pending', 'advance_paid', 'full_paid', 'refunded'];
      if (!validPayments.includes(paymentStatus)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid payment status'
        });
      }
      updateData.paymentStatus = paymentStatus;
    }
    
    if (notes) updateData.notes = notes;
    if (assignedArtist) updateData.assignedArtist = assignedArtist;
    
    const booking = await BridalBooking.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Bridal booking not found' 
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Booking status updated successfully',
      data: booking
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update booking status', 
      error: error.message 
    });
  }
};

// Update payment for bridal booking
export const updateBridalBookingPayment = async (req, res) => {
  try {
    const { amount, paymentType } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid amount is required'
      });
    }
    
    if (!paymentType || !['advance', 'balance'].includes(paymentType)) {
      return res.status(400).json({
        success: false,
        message: 'Payment type must be "advance" or "balance"'
      });
    }
    
    const booking = await BridalBooking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Bridal booking not found' 
      });
    }
    
    if (paymentType === 'advance') {
      booking.advancePayment = amount;
      booking.balanceAmount = booking.totalPrice - amount;
      booking.paymentStatus = amount >= booking.totalPrice ? 'full_paid' : 'advance_paid';
    } else if (paymentType === 'balance') {
      if (amount > booking.balanceAmount) {
        return res.status(400).json({
          success: false,
          message: `Amount cannot exceed balance amount of ${booking.balanceAmount}`
        });
      }
      booking.balanceAmount = booking.balanceAmount - amount;
      if (booking.balanceAmount <= 0) {
        booking.paymentStatus = 'full_paid';
        booking.balanceAmount = 0;
      }
    }
    
    await booking.save();
    
    res.status(200).json({
      success: true,
      message: 'Payment updated successfully',
      data: {
        advancePayment: booking.advancePayment,
        balanceAmount: booking.balanceAmount,
        paymentStatus: booking.paymentStatus,
        totalPrice: booking.totalPrice
      }
    });
  } catch (error) {
    console.error('Update payment error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update payment', 
      error: error.message 
    });
  }
};

// Cancel bridal booking
export const cancelBridalBooking = async (req, res) => {
  try {
    const { reason, refundAmount, cancellationNotes } = req.body;
    
    const booking = await BridalBooking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Bridal booking not found' 
      });
    }
    
    // Check if booking is already cancelled or completed
    if (booking.bookingStatus === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled'
      });
    }
    
    if (booking.bookingStatus === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Completed bookings cannot be cancelled'
      });
    }
    
    booking.bookingStatus = 'cancelled';
    
    // Update notes with cancellation reason
    const cancelNote = `Cancelled on ${new Date().toISOString()}. Reason: ${reason || 'Not provided'}. ${cancellationNotes || ''}`;
    booking.notes = booking.notes ? `${booking.notes}\n${cancelNote}` : cancelNote;
    
    // Handle refund if applicable
    if (refundAmount > 0) {
      booking.paymentStatus = 'refunded';
      booking.balanceAmount = 0;
    }
    
    await booking.save();
    
    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: {
        bookingId: booking.bookingId,
        bookingStatus: booking.bookingStatus,
        paymentStatus: booking.paymentStatus,
        refundAmount: refundAmount || 0
      }
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to cancel booking', 
      error: error.message 
    });
  }
};

// Delete bridal booking
export const deleteBridalBooking = async (req, res) => {
  try {
    const booking = await BridalBooking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Bridal booking not found' 
      });
    }
    
    // Soft delete - mark as deleted instead of actually removing
    // Or you can choose to hard delete based on requirements
    await BridalBooking.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Bridal booking deleted successfully'
    });
  } catch (error) {
    console.error('Delete booking error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete booking', 
      error: error.message 
    });
  }
};

// Get booking statistics
export const getBridalBookingStats = async (req, res) => {
  try {
    const stats = await BridalBooking.aggregate([
      {
        $group: {
          _id: '$bookingStatus',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$totalPrice' },
          totalAdvanceReceived: { $sum: '$advancePayment' }
        }
      }
    ]);
    
    const totalBookings = await BridalBooking.countDocuments();
    const totalRevenue = await BridalBooking.aggregate([
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        statusBreakdown: stats,
        totalBookings,
        totalRevenue: totalRevenue[0]?.total || 0,
        pendingBookings: stats.find(s => s._id === 'pending')?.count || 0,
        confirmedBookings: stats.find(s => s._id === 'confirmed')?.count || 0,
        completedBookings: stats.find(s => s._id === 'completed')?.count || 0,
        cancelledBookings: stats.find(s => s._id === 'cancelled')?.count || 0
      }
    });
  } catch (error) {
    console.error('Get booking stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking statistics',
      error: error.message
    });
  }
};