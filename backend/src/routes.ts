import express from "express";

const routes = express.Router();

routes.get('/users', () => {
    console.log('Listagem de usuários');
});

export default routes;
