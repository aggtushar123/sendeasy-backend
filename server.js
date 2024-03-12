const app = require('./app')

const {errorHandler} = require('./middleware/errorMiddleware') 
const PORT = process.env.PORT || 5000
const connectDB = require('./config/db')

//Connect to Database
connectDB()

app.get('/', (req,res)=>{
    res.status(200).json({message: 'Welcome to Send Easy'})
})

//Routes
app.use('/api/users', require('./user/userRoutes'))
app.use(errorHandler)


app.listen(PORT, ()=> console.log(`Server sarted on port ${PORT}`))


