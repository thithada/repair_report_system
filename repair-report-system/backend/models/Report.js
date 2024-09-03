const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  name: { type: String, required: true },
  building: { 
    type: String, 
    required: true,
    enum: ['UB', 'CE', 'ICT', 'PKY']
  },
  roomNumber: { type: String, required: true },
  details: { type: String, required: true },
  category: { 
    type: String, 
    required: true,
    enum: ['ไมค์โครโฟน', 'อินเตอร์เน็ต', 'โปรเจคเตอร์', 'จอแสดงภาพ', 'ลำโพง', 'เครื่องปรับอากาศ', 'อื่นๆ']
  },
  imagePath: { type: String },
  reportDate: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['รอดำเนินการ', 'กำลังดำเนินการ', 'เสร็จสิ้น'], 
    default: 'รอดำเนินการ' 
  },
  note: { type: String },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Report', reportSchema);