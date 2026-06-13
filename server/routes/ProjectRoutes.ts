import express from 'express';  
import { protect } from '../middlewares/auth.js';
import { deleteProject, getProjectCode, getPublishedProject, getPublishedProjects, makeRevision, rollbackVersion, saveProjectCode } from '../controllers/projectController.js';

const ProjectRouter = express.Router();

ProjectRouter.post('/revision/:projectId',protect, makeRevision);
ProjectRouter.put('/save/:projectId',protect, saveProjectCode);
ProjectRouter.delete('/delete/:projectId',protect, deleteProject);
ProjectRouter.get('/rollback/:projectId/:versionId',protect, rollbackVersion);
ProjectRouter.get('/published',protect, getPublishedProjects);
ProjectRouter.get('/published/:projectId',protect, getPublishedProject);
ProjectRouter.get('/preview/:projectId',protect, getProjectCode);


export default ProjectRouter