import * as Yup from 'yup';

export const phoneVietnameseRegex = /^(0)(3[2-9]|5[2689]|7[06-9]|8[1-9]|9[0-9])[0-9]{7}$/;
export const nameNoNumberNoSpecialRegex = /^[a-zA-ZÀ-ỹ\s]+$/u;

export const guestInfoValidationSchema = Yup.object().shape({
  fullName: Yup.string()
    .trim()
    .required('Vui lòng nhập họ và tên')
    .max(50, 'Họ tên tối đa 50 ký tự')
    .matches(nameNoNumberNoSpecialRegex, 'Họ tên không được chứa số hoặc ký tự đặc biệt'),
  phoneNumber: Yup.string()
    .trim()
    .required('Vui lòng nhập số điện thoại')
    .matches(phoneVietnameseRegex, 'Số điện thoại phải đúng định dạng di động Việt Nam (10 số)'),
  email: Yup.string()
    .trim()
    .required('Vui lòng nhập email')
    .email('Email không đúng định dạng RFC hợp lệ'),
  hasSpecialNote: Yup.boolean().default(true),
  specialNote: Yup.string()
    .max(200, 'Lời nhắn tối đa 200 ký tự')
    .nullable(),
  paymentMethod: Yup.string()
    .oneOf(['NAPAS_QR'])
    .default('NAPAS_QR'),
});

export default guestInfoValidationSchema;
