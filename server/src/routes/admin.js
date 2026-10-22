import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
    res.render('admin/dashboard', { title: 'Admin Dashboard' });
});

export default router;
