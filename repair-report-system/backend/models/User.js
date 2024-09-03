const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'กรุณากรอกอีเมล'],
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^[a-zA-Z0-9._-]+@up\.ac\.th$/.test(v);
      },
      message: props => `${props.value} ไม่ใช่อีเมล @up.ac.th ที่ถูกต้อง`
    }
  },
  password: {
    type: String,
    required: [true, 'กรุณากรอกรหัสผ่าน'],
    minlength: [6, 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร']
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  }
}, {
  timestamps: true
});

// Ensure email is always saved in lowercase
userSchema.pre('save', function(next) {
  this.email = this.email.toLowerCase();
  next();
});

// Add unique index for email
userSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model('User', userSchema);