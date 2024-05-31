import express from 'express';
import path from 'path';
const app = express();
app.set('views', path.join(__dirname, 'views'));
// ejs as a view engine
app.set('view engine', 'ejs');
app.get('/', (req, res) => {
    res.send('Login');
});
app.get('/signup', (req, res) => {
    res.send('Signup');
});
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Serve runing on port: ${PORT}`);
});
//# sourceMappingURL=Server.js.map