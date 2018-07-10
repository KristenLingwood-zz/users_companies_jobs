const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const userRoutes = require('./routes/users');
const companyRoutes = require('./routes/companies');
const jobRoutes = require('./routes/jobs');

app.use(bodyParser.json());
app.use(morgan('dev'));
app.use('/users', userRoutes);
app.use('/companies', companyRoutes);
app.use('/jobs', jobRoutes);

app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  return next(err);
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  return res.json({
    message: err.message,
    error: app.get('env') === 'development' ? err : {}
  });
});

app.listen(3000, function() {
  console.log('server starting on port 3000');
});
