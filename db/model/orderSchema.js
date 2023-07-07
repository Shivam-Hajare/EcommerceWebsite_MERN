import mongoose from "mongoose";
import User from "./userSchema.js";
const orderSchema = new mongoose.Schema(
    {
        userId:{
            type:String,
            require:true
        },
        shippingInfo: {
            fullname: { type: String,
                require:true },
            address: { type: String,
                require:true },
            city: { type: String,
                require:true },
            postalcode: { type: String,
                require:true },
            country: { type: String,
                require:true },
        },
        cartItems:[[Object,]],

    },
    {
      timestamps: true,
    }
)
const Order = mongoose.model("OrderData", orderSchema);
export default Order; 