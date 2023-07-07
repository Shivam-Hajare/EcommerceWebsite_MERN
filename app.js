import express from "express";
//import fetch from "node-fetch";
import dotenv from "dotenv"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import product from "./db/model/productSchema.js";
import User from "./db/model/userSchema.js";
import Order from "./db/model/orderSchema.js";
import verifyToken from "./verifyToken.js";
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
import cors from "cors"
app.use(cors());
import "./db/connection.js"
dotenv.config({ path: "./config.env" })
// async function getPosts(){
//     const myPosts = await fetch("https://dummyjson.com/products");
//     const response = await myPosts .json();
//     for(let i=0;i<response.products.length;i++)
//     {
//         const productData=new product(
//             {
//                 id:response.products[i]['id'],
//                 title:response.products[i]['title'],
//                 description:response.products[i]['description'],
//                 price:response.products[i]['price'],
//                 discountPercentage:response.products[i]['discountPercentage'],
//                 rating:response.products[i]['rating'],
//                 stock:response.products[i]['stock'],
//                 brand:response.products[i]['brand'],
//                 category:response.products[i]['category'],
//                 thumbnail:response.products[i]['thumbnail'],
//                 images:response.products[i]['images'],
//             }

//         )
//        productData.save();
//     // console.log(response.products);
//     }

// }
// getPosts();
const port = process.env.PORT || 5000;

app.get("/api/products", async (req, res) => {
    const PData = await product.find().sort({ "id": 1 })
    res.send(PData)
})

app.get("/product/:id", async (req, res) => {
    const id = req.params.id;
    const PData = await product.find({ id: id });
    if (PData)
        res.send(PData);
    else
        res.status(404).send({ message: "Product Not Found" });
})

app.post("/signup", async (req, res) => {
    const { userName, email, password, cpassword } = req.body;
    if (!userName || !email || !password || !cpassword) {
        return res.status(422).json({ error: "Plaese fill all filds" })
    }
    try {
        const userExist = await User.findOne({ email: email })
        if (userExist)
            return res.status(422).json({ error: "User already exist.." })
        else if (password != cpassword)
            return res.status(422).json({ error: "password are not matching" })

        else {

            const saltRounds = 10;
            const myPlaintextPassword = password;
            const someOtherPlaintextPassword = 'not_bacon';

            bcrypt.hash(myPlaintextPassword, saltRounds, async function (err, hash) {
                // Store hash in your password DB.
                if (!hash)
                    return res.status(422).json({ error: "Prob in hashing" })

                const user = new User({ userName, email, password: hash, cpassword: hash })
                await user.save();
            });
            res.status(201).json({ message: "successful stored db" })

        }
    } catch (err) {
        console.log(err);
    }
})
app.post("/signin", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(422).json({ error: "Plaese fill all filds" })
    }
    try {
        const userExist = await User.findOne({ email: email })

        if (!userExist)
            return res.status(422).json({ error: "User not exist.." })

        const isPasswordValid = await bcrypt.compare(password, userExist.password);
        if (!isPasswordValid) {
            return res.status(422).json({ message: "Username or password is incorrect" });
        }
        const token = jwt.sign({ id: userExist._id }, process.env.JWT_SECRET);
        res.status(200).json({ token, userID: userExist._id });
        // else {
        //     //JWT token generation
        //     var token = jwt.sign({userExist}, process.env.JWT_SECRET);
        //     //to token in cookie
        //    // console.log(token);
        //     res.cookie("jwtoken",token,{ 
        //         expires: new Date(Date.now()+25920000000)
        //     });
        //     const hash=userExist.password;
        //     const myPlaintextPassword = password;

        //     bcrypt.compare(myPlaintextPassword, hash, async function (err, result) {
        //         // Store hash in your password DB.
        //         if (!result)
        //         return res.status(422).json({ error: "Invalid userName or Password" })
        //         else
        //         res.status(201).json({ message: "user logged in" })
        //     });

        // }
    } catch (err) {
        console.log(err);
    }
})
app.post("/placeOrder", async (req, res) => {
    const { userId, shippingInfo, cartItems } = req.body;



    console.log(shippingInfo);
    if (!shippingInfo || !cartItems)
        return res.status(422).json({ error: "shipping and cart data not received" });
    try {
        const { fullname, address, city, postalcode, country } = shippingInfo;
        const userExist = await Order.findOne({ userId })


        // Generate a unique order ID
        function generateOrderId() {
            return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
        }

        // Create the object with orderDate and orderId fields
        var order = {
            ...cartItems[0],
            orderDate: new Date().toISOString().slice(0, 10),
            orderId: generateOrderId(),
            nm:"shivam"
        };


        if (userExist) {
            let temp = userExist.cartItems
            // console.log(temp ? "aloo" : "nahi alo");

            

            temp.push(order)
            const doc = await Order.findOneAndUpdate({ 'userId': userId }, {
                'cartItems': temp
            });

            res.sendStatus(200).json({ "msg": "done" })
        }
        else {
            const orderData = new Order({ shippingInfo: { fullname, address, city, postalcode, country }, cartItems:order, userId })
            await orderData.save();
            res.sendStatus(200).json({ "msg": "done" })

        }

    } catch (err) {
        console.log(err);
    }
})
app.get("/orderHistory/:id", async (req, res) => {
    const userId = req.params.id;
    const userExist = await Order.findOne({ userId: userId })

    if (userExist) {
        //  console.log(userExist);
        res.send(userExist);
    }
    else
        res.status(404).send({ message: "user Not Found" });
})


app.listen(port, () => {
    console.log("server is running on " + port);
})