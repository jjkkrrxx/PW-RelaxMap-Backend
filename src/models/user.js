import { model, Schema } from 'mongoose';

const DEFAULT_AVATAR =
  'https://ac.goit.global/fullstack/react/default-avatar.jpg';

const userSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      minlength: 2,
      maxlength: 32,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      required: true,
      unique: true,
      maxlength: 64,
    },
    password: { type: String, required: true },
    avatar: { type: String, required: true, default: DEFAULT_AVATAR },
    articlesAmount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);

// за ТЗ: дефолтний аватар у pre('save'), якщо прийшов порожній рядок
userSchema.pre('save', function () {
  if (!this.avatar) {
    this.avatar = DEFAULT_AVATAR;
  }
});

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export const User = model('User', userSchema);
