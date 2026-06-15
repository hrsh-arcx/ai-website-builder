import express from "express";
import { protect } from "../middlewares/auth.js";
import { createUserProject, deleteUser, getUserCredits, getUserProject, getUserProjects, purchaseCredits, togglePublish } from "../controllers/userController.js";
const UserRouter = express.Router();


UserRouter.get('/credits', protect, getUserCredits);
UserRouter.post('/project', protect, createUserProject);
UserRouter.get('/project/:projectId', protect, getUserProject);
UserRouter.get('/projects', protect, getUserProjects);
UserRouter.get('/publish-toggle/:projectId', protect, togglePublish);
UserRouter.post('/credits-purchase', protect, purchaseCredits);
UserRouter.delete('/delete',protect,deleteUser);

export default UserRouter

