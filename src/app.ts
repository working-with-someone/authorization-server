import express from 'express';

const app = express();

app.set('view engine', 'ejs');
app.set('views', `${process.cwd()}/wws-client/public`);

app.get('/', (req, res) => {
  res.render('auth/signin');
});

export default app;
