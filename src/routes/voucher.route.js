import express from 'express';
import {
    getAllVoucher,
    getVoucherById,
    getVoucherByCode,
    getActiveVouchers,
    createVoucher,
    updateVoucher,
    deleteVoucher,
    searchVoucher
} from '../controllers/voucher.controller.js';

const voucherRouter = express.Router();

voucherRouter.get('/', getAllVoucher);
voucherRouter.get('/active', getActiveVouchers);
voucherRouter.get('/search', searchVoucher);
voucherRouter.get('/code/:ma_voucher', getVoucherByCode);
voucherRouter.get('/:id', getVoucherById);
voucherRouter.post('/', createVoucher);
voucherRouter.put('/:id', updateVoucher);
voucherRouter.delete('/:id', deleteVoucher);

export default voucherRouter;