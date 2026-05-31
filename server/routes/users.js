const { Router  } = require('express');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const userService = require('../services/UserService');

const router = Router();

router.post('/register', async (req, res, next) => {
  try {
    const user = await userService.register(req.body);
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const result = await userService.login(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get('/users', auth, role('admin'), async (req, res, next) => {
  try {
    const users = await userService.getAll();
    res.json(users);
  } catch (err) {
    next(err);
  }
});

router.put('/users/:id', auth, role('admin'), async (req, res, next) => {
  try {
    const user = await userService.update(req.params.id, req.body);
    res.json(user);
  } catch (err) {
    next(err);
  }
});

router.put('/users/:id/toggle-seller', auth, role('admin'), async (req, res, next) => {
  try {
    const user = await userService.toggleSeller(req.params.id);
    res.json(user);
  } catch (err) {
    next(err);
  }
});

module.exports = router;