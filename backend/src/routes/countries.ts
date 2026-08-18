import { Router } from 'express';
import { listCountries, listCurrencies } from '../controllers/countries.js';

const router = Router();
router.get('/', listCountries);
router.get('/currencies', listCurrencies);
export default router;
