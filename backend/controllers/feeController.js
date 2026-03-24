// controllers/feeController.js
import feeModel from "../models/feeModel.js";
import studentModel from "../models/studentModel.js";
import billModel from "../models/billModel.js";
import settingModel from "../models/settingModel.js";
import PDFDocument from "pdfkit";

/* GET FEES BY MONTH */
export const getFeesByMonthController = async (req, res) => {
  try {
    const { month } = req.query;

    const fees = await feeModel
      .find({
        ownerId: req.user.userId,
        month,
      })
      .populate("studentId", "name phone");

    res.json({ success: true, fees });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

export const generateMonthlyFeesController = async (req, res) => {
  try {
    const { month } = req.body;

    const students = await studentModel.find({
      ownerId: req.user.userId,
      roomId: { $ne: null },
      studentStatus: "active", 
    }).populate("roomId");

    for (let s of students) {
      const exists = await feeModel.findOne({
        studentId: s._id,
        month,
      });
      if (exists) continue;

      const fee = await feeModel.create({
        studentId: s._id,
        hostelId: s.hostelId,
        ownerId: s.ownerId,
        month,
        monthlyRent: s.monthlyRent,
        startDate: s.createdAt,
        roomSnapshot: {
          roomNumber: s.roomId.roomNumber,
          bedNumber: s.bedNumber,
          roomType: s.roomId.type,
        },
      });

      await billModel.create({
        billNumber: `HB-${month}-${s._id.toString().slice(-4)}`,
        studentId: s._id,
        ownerId: s.ownerId,
        month,
        amount: s.monthlyRent,
        studentSnapshot: {
          name: s.name,
          email: s.email,
          parentemail: s.parentemail,
          roomNumber: s.roomId.roomNumber,
          bedNumber: s.bedNumber,
          roomType: s.roomId.type,
        },
      });
    }

    res.json({ success: true, message: "Fees generated" });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

export const markFeePaidController = async (req, res) => {
  try {
    const { feeId } = req.params;
    const { paymentMode } = req.body;

    const fee = await feeModel.findById(feeId);
    if (!fee) {
      return res.status(404).json({ success: false, message: "Fee not found" });
    }

    fee.status = "PAID";
    fee.paymentMode = paymentMode;
    fee.paidOn = new Date();
    await fee.save();

    await billModel.updateOne(
      { studentId: fee.studentId, month: fee.month },
      { status: "PAID" }
    );

    res.json({ success: true, message: "Fee marked as paid" });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

export const getStudentPaymentsController = async (req, res) => {
  try {
    const bills = await billModel.find({
      studentId: req.user.studentId,
      status: "PAID",
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      payments: bills,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
};

export const downloadBillController = async (req, res) => {
  try {
    // Check if invoice download is enabled by admin
    const settings = await settingModel.findOne();
    if (settings && !settings.studentControls?.view_invoice) {
      return res.status(403).json({
        success: false,
        message: "Invoice download is currently disabled by the admin.",
      });
    }

    const { month } = req.params;

    const bill = await billModel.findOne({
      studentId: req.user.studentId,
      month,
      status: "PAID",
    });

    if (!bill) {
      return res.status(404).json({ message: "Bill not found or unpaid" });
    }

    const doc = new PDFDocument({ 
      margin: 50,
      size: 'A4'
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Hostel_Bill_${month}.pdf`
    );

    doc.pipe(res);

    // Header with background color
    doc.rect(0, 0, doc.page.width, 120).fill('#2C3E50');
    
    // Title
    doc.fillColor('#FFFFFF')
       .fontSize(28)
       .font('Helvetica-Bold')
       .text('HOSTEL FEE RECEIPT', 50, 40, { align: 'center' });
    
    doc.fontSize(12)
       .font('Helvetica')
       .text('Official Payment Receipt', { align: 'center' });

    // Reset position after header
    doc.fillColor('#000000');
    doc.y = 150;

    // Bill Information Section
    doc.fontSize(10)
       .font('Helvetica')
       .fillColor('#7F8C8D')
       .text('BILL INFORMATION', 50, doc.y);
    
    doc.moveTo(50, doc.y + 15)
       .lineTo(doc.page.width - 50, doc.y + 15)
       .stroke('#BDC3C7');
    
    doc.moveDown(1.5);

    // Two-column layout for bill details
    const leftCol = 50;
    const rightCol = 320;
    let currentY = doc.y;

    doc.fillColor('#000000')
       .fontSize(11)
       .font('Helvetica-Bold')
       .text('Bill Number:', leftCol, currentY)
       .font('Helvetica')
       .text(bill.billNumber, leftCol + 90, currentY);

    doc.font('Helvetica-Bold')
       .text('Status:', rightCol, currentY)
       .font('Helvetica')
       .fillColor('#27AE60')
       .text('PAID', rightCol + 60, currentY);

    currentY += 25;
    doc.fillColor('#000000')
       .font('Helvetica-Bold')
       .text('Billing Month:', leftCol, currentY)
       .font('Helvetica')
       .text(bill.month, leftCol + 90, currentY);

    doc.font('Helvetica-Bold')
       .text('Date:', rightCol, currentY)
       .font('Helvetica')
       .text(new Date(bill.paidAt || bill.createdAt).toLocaleDateString('en-IN'), rightCol + 60, currentY);

    doc.moveDown(2);

    // Student Information Section
    doc.fontSize(10)
       .font('Helvetica')
       .fillColor('#7F8C8D')
       .text('STUDENT DETAILS', 50, doc.y);
    
    doc.moveTo(50, doc.y + 15)
       .lineTo(doc.page.width - 50, doc.y + 15)
       .stroke('#BDC3C7');
    
    doc.moveDown(1.5);

    // Student details box
    const boxTop = doc.y;
    doc.roundedRect(50, boxTop, doc.page.width - 100, 110, 5)
       .fillAndStroke('#F8F9FA', '#E0E0E0');

    currentY = boxTop + 20;
    doc.fillColor('#000000')
       .fontSize(11)
       .font('Helvetica-Bold')
       .text('Student Name:', 70, currentY)
       .font('Helvetica')
       .text(bill.studentSnapshot.name, 180, currentY);

    currentY += 25;
    doc.font('Helvetica-Bold')
       .text('Room Number:', 70, currentY)
       .font('Helvetica')
       .text(bill.studentSnapshot.roomNumber, 180, currentY);

    doc.font('Helvetica-Bold')
       .text('Bed Number:', 340, currentY)
       .font('Helvetica')
       .text(bill.studentSnapshot.bedNumber, 430, currentY);

    currentY += 25;
    doc.font('Helvetica-Bold')
       .text('Room Type:', 70, currentY)
       .font('Helvetica')
       .text(bill.studentSnapshot.roomType, 180, currentY);

    doc.y = boxTop + 130;
    doc.moveDown(1.5);

    // Payment Details Section
    doc.fontSize(10)
       .font('Helvetica')
       .fillColor('#7F8C8D')
       .text('PAYMENT DETAILS', 50, doc.y);
    
    doc.moveTo(50, doc.y + 15)
       .lineTo(doc.page.width - 50, doc.y + 15)
       .stroke('#BDC3C7');
    
    doc.moveDown(1.5);

    // Amount breakdown table
    const tableTop = doc.y;
    const tableLeft = 50;
    const tableWidth = doc.page.width - 100;

    // Table header
    doc.rect(tableLeft, tableTop, tableWidth, 30)
       .fill('#34495E');
    
    doc.fillColor('#FFFFFF')
       .fontSize(11)
       .font('Helvetica-Bold')
       .text('Description', tableLeft + 20, tableTop + 10)
       .text('Amount', tableLeft + tableWidth - 120, tableTop + 10);

    // Table row
    doc.rect(tableLeft, tableTop + 30, tableWidth, 35)
       .fillAndStroke('#FFFFFF', '#E0E0E0');
    
    doc.fillColor('#000000')
       .font('Helvetica')
       .text('Hostel Fee - ' + bill.month, tableLeft + 20, tableTop + 42)
       .font('Helvetica-Bold')
       .text('₹' + bill.amount.toFixed(2), tableLeft + tableWidth - 120, tableTop + 42);

    // Total row
    doc.rect(tableLeft, tableTop + 65, tableWidth, 40)
       .fill('#ECF0F1');
    
    doc.fillColor('#000000')
       .fontSize(13)
       .font('Helvetica-Bold')
       .text('Total Amount Paid', tableLeft + 20, tableTop + 78)
       .fontSize(16)
       .fillColor('#27AE60')
       .text('₹' + bill.amount.toFixed(2), tableLeft + tableWidth - 140, tableTop + 76);

    doc.y = tableTop + 120;
    doc.moveDown(2);

    // Footer
    doc.fontSize(9)
       .fillColor('#7F8C8D')
       .font('Helvetica-Oblique')
       .text('This is a computer-generated receipt and does not require a signature.', 
             50, doc.y, 
             { align: 'center', width: doc.page.width - 100 });

    doc.moveDown(0.5);
    doc.text('For any queries, please contact the hostel administration.', 
             { align: 'center', width: doc.page.width - 100 });

    // Add footer line at bottom
    doc.moveTo(50, doc.page.height - 80)
       .lineTo(doc.page.width - 50, doc.page.height - 80)
       .stroke('#BDC3C7');

    doc.fontSize(8)
       .fillColor('#95A5A6')
       .text(`Generated on: ${new Date().toLocaleString('en-IN')}`, 
             50, doc.page.height - 65, 
             { align: 'center', width: doc.page.width - 100 });

    doc.end();
  } catch (err) {
    console.error('PDF Generation Error:', err);
    res.status(500).json({ message: "Failed to generate bill" });
  }
};