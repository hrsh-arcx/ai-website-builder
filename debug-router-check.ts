import UserRouter from './server/routes/UserRoutes.ts';
import ProjectRouter from './server/routes/ProjectRoutes.ts';

console.log('UserRouter routes:');
UserRouter.stack.forEach((layer: any) => {
  if (layer.route) {
    console.log(layer.route.path, layer.route.methods);
  } else {
    console.log('middleware', layer.name);
  }
});
console.log('ProjectRouter routes:');
ProjectRouter.stack.forEach((layer: any) => {
  if (layer.route) {
    console.log(layer.route.path, layer.route.methods);
  } else {
    console.log('middleware', layer.name);
  }
});
