import express from 'express';
import cors from 'cors';


const app = express();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const apiV1Router = express.Router();


export default app;
